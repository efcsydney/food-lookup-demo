const Event = require('../models/event').Event;
const CalendarDate = require('../models/calendar-date').CalendarDate;
const Position = require('../models/position').Position;
const Repository = require('../data/repository').Repository;
const EventService = require("../service/events-service").EventService;
const EventMapper = require("../mapper/event-mapper").EventMapper;

async function getEvents(req, res) {
  const dateRange = EventService.computeDateRange({from: req.query.from, to: req.query.to});
  const events = await Repository.getEventsByDateRange({from: dateRange.from, to: dateRange.to});
  const dto = EventMapper.convertEventsModelToDto(events);

  const response = {
    success: 'OK',
    error: { message: ""},
    data: dto
  }

  console.log(JSON.stringify(response, null, 2));
  return res.json(response);
}

async function saveEvent(req, res){
  const event = EventMapper.convertDtoToEventModel(req.body.data);
  const dbEvent = await Repository.getEventByDatePosition({date: event.calendarDate.date, position: event.position.name});
  if(dbEvent != null && dbEvent.id > 0){
    await Repository.updateEvent(event);
  }else{
    await Repository.saveEvent(event);
  }

  const response = {
    success: 'OK',
    error: { message: ""}
  }

  return res.json(response);
}

module.exports = {
  getEvents,
  saveEvent
}