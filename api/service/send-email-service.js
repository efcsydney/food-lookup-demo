const moment = require('moment');
const emailUtils = require('../../scripts/email/utils');
const sendEmail = emailUtils.sendEmail;
const getEmailHTML = emailUtils.getEmailHTML;
const datetimeUtil = require('../utilities/datetime-util');
const getDateString = datetimeUtil.getDateString;
const getDateByWeeks = datetimeUtil.getDateByWeeks;
const EventRepository = require('../data/event-repository').EventRepository;
const ServiceCalendarDateRepository = require('../data/service-calendar-date-repository')
  .ServiceCalendarDateRepository;
const Service = require('../models/service').Service;
const EventMapper = require('../mapper/event-mapper').EventMapper;
const config = require('config');
const log = require('../utilities/logger');
const { readAndParseFile } = require('../utilities/csv-helper');
const { EmailListItem } = require('../models/email-list-item');
const _ = require('lodash');

const emailCsvFilePath = config.get('reminderEmail.emailListFilePath');
const emailListFromCsv = parseCsvEmailFile(emailCsvFilePath);

/**
 * Generate email list string include names and emails
 *
 * @return {String} example: 新週報 <newsletter@efcsydney.org>, 教會音控 <ppt@efcsydney.org>, Ava<ava_tab@example.com>
 */
function getEmailListString() {
  const applyEmailTemplate = emailTo => {
    if (emailTo.englishName) {
      return `${emailTo.englishName}<${emailTo.email}>`;
    }
    return `${emailTo.chineseName}<${emailTo.email}>`;
  };
  return getEmailList()
    .map(applyEmailTemplate)
    .join(',');
}

/*
 * Generate email list in javascript objects
 */
function getEmailList() {
  const emptyEmail = emailTo => !!emailTo.email;
  return emailListFromCsv.filter(emptyEmail);
}

function getEmptyEmailListString() {
  const applyEmailTemplate = emailTo =>
    emailTo.englishName ? `${emailTo.englishName}` : `${emailTo.chineseName}`;
  const nonEmptyEmail = emailTo => !emailTo.email;
  const emailString = emailListFromCsv
    .filter(nonEmptyEmail)
    .map(applyEmailTemplate)
    .join(',');

  log.debug(emailString);
  return emailString;
}

/*
  This function is supposed to take an input of CSV file directory and return a list of JS object
  [
    {
      email: 'fake_email@email.com,
      englishName: '',
      chineseName: '',
    }
  ]
*/
function parseCsvEmailFile(emailCsvFilePath) {
  const emailList = readAndParseFile(emailCsvFilePath);
  const mapToEmailItem = emailItem => new EmailListItem(emailItem);
  const excludeMetadataItem = emailItem => !emailItem.isMetaData;

  const mappedEmailList = emailList
    .map(mapToEmailItem)
    .filter(excludeMetadataItem);

  return mappedEmailList;
}

// This is a mock due to we only have one service at the moment
async function buildEventsForMultipleServices(from, to) {
  const events = {};
  const services = await Service.findAll();
  await Promise.all(
    services.map(async service => {
      let positions = await service.getPositions();
      positions = positions.map(p => ({ position: p.name }));
      const eventsForService = await EventRepository.getEventsByDateRange(
        { from, to },
        service.name
      );
      const serviceInfo = await ServiceCalendarDateRepository.getServiceInfoByDateRange(
        { from, to },
        service.name
      );
      events[service.name] = EventMapper.groupEventsByCalendarDate(
        eventsForService
      );
      events[service.name].forEach((event, index) => {
        event.lang = service.locale;
        event.serviceInfo = serviceInfo[index];
        event.serviceInfo.positions = positions.map(p => {
          const matched =
            event.positions.find(ep => ep.position === p.position) || {};

          return {
            position: p.position,
            volunteerName: matched.volunteerName || ''
          };
        });
      });
      return events;
    })
  );
  return events;
}

async function getCurrentEmailHTML() {
  const fromDate = getDateString(new Date());
  const toDate = getDateByWeeks(fromDate, 2);
  let events = await buildEventsForMultipleServices(fromDate, toDate);
  events = _.pick(events, ['english', 'chinese']); // Only show these 2 services for now #215
  const nameList = getNameList(events);
  const emailList = getEmailList();

  const reminderEmailList = emailList.filter(
    e => nameList.includes(e.englishName) || nameList.includes(e.chineseName)
  );

  const nameListWithEmail = reminderEmailList
    .map(e => e.englishName)
    .concat(reminderEmailList.map(e => e.chineseName))
    .filter(e => e != '');

  const nameListWithoutEmail = nameList
    .filter(n => !nameListWithEmail.includes(n))
    .filter(n => n !== 'Combined Service' && n !== '暫停' && n !== '一家一菜')
    .join(',');

  return getEmailHTML(events, reminderEmailList, nameListWithoutEmail);
}

// reminderEmail will send email for the next 2 weeks
async function reminderEmail() {
  const currentEmailHTML = await getCurrentEmailHTML();
  const fromMoment = moment(getDateString(new Date()));
  const fromDate = fromMoment.endOf('isoWeek').format('DD/MM');
  const toMoment = fromMoment.add('weeks', 1);
  const toDate = toMoment.format('DD/MM');

  return sendEmail({
    from: config.get('reminderEmail.content.from'),
    to: config.get('reminderEmail.content.to'),
    cc: config.get('reminderEmail.content.cc'),
    subject: `[自動提醒] 這週(${fromDate})與下週(${toDate})的主日服事`,
    html: currentEmailHTML
  });
}

function filterPositions(positions = [], blacklist) {
  blacklist = blacklist || config.get('reminderEmail.skipRoles') || [];
  return positions.filter(({ position }) => !blacklist.includes(position));
}

function getNameList(events) {
  return _.uniq(
    events.english
      .concat(events.chinese)
      .map(day => filterPositions(day.positions))
      .reduce((result, e) => result.concat(e), [])
      .map(e => e.volunteerName)
      .filter(e => e != '')
  );
}

module.exports = {
  buildEventsForMultipleServices,
  reminderEmail,
  filterPositions,
  getCurrentEmailHTML,
  getNameList,
  getEmailList,
  getEmailListString,
  getEmptyEmailListString,
  parseCsvEmailFile
};
