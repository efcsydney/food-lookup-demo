const { mjml2html } = require('mjml');
const _ = require('lodash');
const moment = require('moment');
const nodemailer = require('nodemailer');
const log = require('../../api/utilities/logger');
const config = require('config');

require('moment/locale/en-au');
require('moment/locale/zh-tw');

const cellStyle = `
  border: 1px solid #000;
  border-width: 0 1px 1px 0;
  font-size: 12px;
  line-height: 1.3;
  padding: 6px 4px;
  text-align: center;
  white-space: nowrap;
`;
const firstCellStyle = `
  border: 1px solid #000;
  border-width: 0 1px 1px 1px;
  font-size: 12px;
  line-height: 1.3;
  padding: 6px 4px;
  text-align: center;
  white-space: nowrap;
`;
const cellHeaderStyle = `
  background: #f0f0f0;
  border: 1px solid #000;
  border-width: 1px 1px 1px 0;
  font-size: 12px;
  font-weight: normal;
  line-height: 1.3;
  padding: 6px 4px;
  text-align: center;
  white-space: nowrap;
`;
const firstHeaderCellStyle = `
  background: #f0f0f0;
  border: 1px solid #000;
  border-width: 1px;
  font-size: 12px;
  font-weight: normal;
  line-height: 1.3;
  padding: 6px 4px;
  text-align: center;
  white-space: nowrap;
`;
const emptyCellStyle = `
  color: #999;
  font-size: 12px;
  line-height: 1.3;
  padding: 6px 4px;
  text-align: center;
  white-space: nowrap;
`;

function decorateDay(day, blacklist) {
  let positions = day.serviceInfo.positions || [];
  positions = _.filter(
    positions,
    ({ position }) => blacklist.indexOf(position) === -1
  ).map(position => {
    const matched =
      day.positions.find(p => p.position === position.position) || {};
    return {
      position,
      volunteerName: matched.volunteerName || 'x'
    };
  });

  day.positions = positions;

  return day;
}

function removePositionNumber(position) {
  const regExp = /([^\d]+)(\d)$/;
  const matches = position.match(regExp);
  return matches ? matches[1] : position;
}

const renderHeaderRow = (lang, roles) => {
  const dateLabel = lang === 'zh-TW' ? '日期' : 'Date';
  const footnoteLabel = lang === 'zh-TW' ? '型式' : 'Occasion';
  const positions = roles.map(({ position }) => removePositionNumber(position));

  return `
    <tr>
      <th style="${firstHeaderCellStyle}">${dateLabel}</th>
      <th style="${cellHeaderStyle}">${footnoteLabel}</th>
      ${_.uniq(positions)
        .map(cell => {
          const colSpan = _.filter(positions, val => cell === val).length;
          return `
          <th
            colspan=${colSpan}
            style="${cellHeaderStyle}">
            ${cell}
          </th>
        `;
        })
        .join('\n')}
    </tr>
  `;
};

const renderMemberRow = ({ date, serviceInfo, positions, lang }) => {
  moment.locale(lang);
  if (lang === 'zh-TW') {
    date = moment(date).format('MMMDo');
  } else if (lang === 'en-AU') {
    date = moment(date).format('D MMM');
  } else {
    date = moment(date).format('ll');
  }

  const footnote =
    serviceInfo.footnote || `<span style="${emptyCellStyle}">-</span>`;
  const contentCells = !serviceInfo.skipService
    ? serviceInfo.positions
        .map(
          ({ volunteerName }) => `
      <td style="${cellStyle}">${
            volunteerName
              ? volunteerName
              : `<span style="${emptyCellStyle}">-</span>`
          }</td>
      `
        )
        .join('\n')
    : `<td style="${cellStyle}" colspan=${positions.length}>${
        serviceInfo.skipReason
      }</td>`;

  return `
    <tr>
      <td style="${firstCellStyle}">${date}</td>
      <td style="${cellStyle}">${footnote}</td>
      ${contentCells}
    </tr>
  `;
};

const renderTable = days => {
  const blacklist = config.get('reminderEmail.skipRoles');

  days.sort((a, b) => (a.date > b.date ? 1 : -1));
  days = days.map(day => decorateDay(day, blacklist));

  const lang = _.get(days, '0.lang', 'zh-TW');
  const roles = _.get(days, '0.serviceInfo.positions', []);
  const title = _.get(days, '0.serviceInfo.service.label', '');

  if (!days.length) {
    return '';
  }

  return `
    <mj-section padding="5px 0 10px">
      <mj-text font-size="16" font-weight="bold" line-height="30px">
        ${title}
      </mj-text>
      <mj-table padding="0">
        ${renderHeaderRow(lang, roles)}
        ${days.map(day => renderMemberRow(day)).join('')}
      </mj-table>
    </mj-section>
  `;
};

const renderDraftTable = (title, emailList, emptyEmailList) => {
  const emails = emailList.map(item => {
    return {
      name: item.englishName,
      email: item.email
    };
  });

  const thStyle = `
    border: 1px solid #f99;
    font-size: 11px;
    font-weight: normal;
    line-height: 1.3;
    padding: 8px;
    text-align: right;
    vertical-align: top;
    white-space: nowrap;
    margin: 2px;
  `;
  const tdStyle = `
    border: 1px solid #f99;
    font-size: 11px;
    line-height: 1.3;
    padding: 8px;
    text-align: left;
    vertical-align: top;
    margin: 2px;
  `;
  const tdWarnStyle = `
    background: #fdf3f0;
    border: 1px solid #f99;
    border-collapse: separate;
    font-size: 11px;
    line-height: 1.3;
    padding: 8px;
    text-align: left;
    vertical-align: top;
    margin: 2px;
  `;

  emailList = emails
    .map(
      ({ name, email }) =>
        `<span>${name} &amp;lt;<a href="mailto:${email}">${email}</a>&amp;gt;</span>`
    )
    .join(', ');

  return `
    <mj-table class="draft-table">
      <tr>
        <th style="${thStyle}">標題</th>
        <td style="${tdStyle}">${title}</td>
      </tr>
      <tr>
        <th style="${thStyle}">收件人</th>
        <td style="${tdStyle}">${emailList}</td>
      </tr>
      <tr>
        <th style="${thStyle}">缺少 Email</th>
        ${
          !_.isEmpty(emptyEmailList)
            ? `<td style="${tdWarnStyle}">${emptyEmailList}</td>`
            : `<td style="${tdStyle}">無</td>`
        }
      </tr>
    </mj-table>
  `;
};

/**
 * Generate Email HTML according to events
 *
 * @method getEmailHTML
 * @param events {Object}
 * @param emailList {String}
 * @param missingList {String}
 * @return {String}
 */
exports.getEmailHTML = (events, emailList, emptyEmailList) => {
  const dates = _.values(events.chinese)
    .map(event => event.date)
    .sort();
  const thisWeek = moment(dates[0]).format('DD/MM');
  const nextWeek = moment(dates[0])
    .add('w', 1)
    .format('DD/MM');
  const title = `這週(${thisWeek})與下週(${nextWeek})的主日服事`;
  const mjml = `
    <mjml>
      <mj-head>
        <mj-style>
        a:link, a:visited {
          color: #15c;
          text-decoration: none;
        }
        .draft-table {
          border-collapse: separate;
          margin: 50px;
        }
        .container {
          font-family: Lato,Helvetica Neue,Arial,Helvetica,sans-serif;
        }
        </mj-style>
      </mj-head>
      <mj-body>
        <mj-container width="960px" css-class="container">
          <mj-wrapper padding="10px 0 5px">
            <mj-section padding="10px 15px" border="solid 1px #f99" background-color="#fdf3f0">
              <mj-text font-size="14px" color="#d14836">⚠️ &nbsp; 請參考以下系統幫您準備的服事提醒草稿，每週自動寄給服事助理同工</mj-text>
            </mj-section>
          </mj-wrapper>
          <mj-section padding="5px 0 0">
            ${renderDraftTable(title, emailList, emptyEmailList)}
            <mj-section padding="5px 0 0">
              <mj-text>若需修改服事表請至：<a href="http://roster.efcsydney.org">http://roster.efcydney.org</a></mj-text>
            </mj-section>
          </mj-section>
          <mj-section padding="5px 0 5px">
            <mj-divider border-width="1px" border-style="dashed" border-color="lightgrey" />
          </mj-section>
          <mj-section padding="5px 0 5px">
            <mj-text font-size="14px">各位弟兄姊妹平安</mj-text>
            <mj-text font-size="14px">Dear all,</mj-text>
          </mj-section>
          <mj-section padding="5px 0 5px">
            <mj-text font-size="14px">溫馨提醒下兩週的同工預備心服事</mj-text>
            <mj-text font-size="14px">A friendly reminder for all who serve in this coming Sunday and the following Sunday.</mj-text>
          </mj-section>
          <mj-section>
            <mj-text font-size="14px">THANK YOU :))</mj-text>
          </mj-section>
          <mj-section padding="5px 0 5px">
            ${_.values(events)
              .map(event => renderTable(event))
              .join('\n')}
          </mj-section>
          <mj-section padding="0">
            <mj-text font-size="12px" line-height="1.4">Regards<br/></mj-text>
            <mj-text font-size="12px" line-height="1.4">PP</mj-text>
          </mj-section>
        </mj-container>
      </mj-body>
    </mjml>
  `;

  return mjml2html(mjml).html;
};

/**
 * Send email
 *
 * @method sendEmail
 * @param account sending gmail account { user: 'x@example.com', pass: 'somepassword'}
 * @param mailOptions { from: 'from@example.com', to: 'a@xample.com, b@example.com ...', subject: 'whatever', html: '<html/>' }
 * @return {Promise}
 */
exports.sendEmail = mailOptions => {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: config.get('emailService.smtp'),
    auth: config.get('emailService.authentication')
  });

  // send mail with defined transport object
  return transporter
    .sendMail({
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      html: mailOptions.html
    })
    .then(info => {
      log.info('email sent');
      return info;
    });
};
