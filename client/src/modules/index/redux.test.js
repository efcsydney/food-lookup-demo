import {
  defaultState,
  dataReducer,
  isLoadingReducer,
  toggleEditDay,
  toggleEditRole,
  receiveRetrieveEvents,
  receiveModifyIdEvents,
  receiveModifyServiceInfo,
  setSelectedData,
  setServiceInfo,
  selectedDataReducer,
  requestRetrieveEvents
} from './redux';
import moment from 'moment';

describe('index', () => {
  describe('dataReducer', () => {
    const initState = defaultState.data;
    const mockState = [
      {
        date: '2018-02-18',
        members: [
          { role: 'Speaker', name: 'Rev. Kian Holik' },
          { role: 'Moderator', name: 'Jennifer Chu' },
          { role: 'P&W', name: 'Edison Huang' },
          { role: 'Pianist', name: 'Yvonne Lu' },
          { role: 'Usher/Offering', name: 'Amy Chen' },
          { role: 'PA/PPT', name: 'Raymond Tsang' },
          { role: 'Newsletter', name: 'Robin Zhang' },
          { role: 'Refreshments', name: 'Betty Chen' }
        ],
        serviceInfo: {
          footnote: '',
          id: 120,
          skipReason: '',
          skipService: false
        }
      },
      {
        date: '2018-02-25',
        members: [
          { role: 'Speaker', name: 'May Chien' },
          { role: 'Moderator', name: 'Angela Sun' },
          { role: 'P&W', name: 'Jenny Hsu' },
          { role: 'Pianist', name: 'Joseph Wang' },
          { role: 'Usher/Offering', name: 'Amy Chen' },
          { role: 'PA/PPT', name: 'Joseph Chiang' },
          { role: 'Newsletter', name: 'Robin Zhang' },
          { role: 'Refreshments', name: 'Jennifer Chu' }
        ],
        serviceInfo: {
          footnote: '',
          id: 122,
          skipReason: '',
          skipService: false
        }
      }
    ];

    it('should have initial state', () => {
      const result = dataReducer(undefined, { type: 'xxx' });
      expect(result).toBe(initState);
    });
    it('should be updated by #receiveRetrieveEvents', () => {
      const payload = [{ id: 1 }, { id: 2 }];
      const result = dataReducer(initState, receiveRetrieveEvents(payload));
      expect(result).toBe(payload);
    });
    it('should be updated by #receiveRetrieveEvents', () => {
      const payload = [{ id: 1 }, { id: 2 }];
      const result = dataReducer(initState, receiveRetrieveEvents(payload));
      expect(result).toBe(payload);
    });
    it('should be overwritten by #receiveRetrieveEvents', () => {
      const result = dataReducer(initState, receiveRetrieveEvents(mockState));
      expect(result).toBe(mockState);
    });
    it('should be updated by #receiveModifyIdEvents', () => {
      const state = [
        {
          date: '2018-02-25',
          members: [{ role: 'Newsletter', name: 'Robin Zhang' }]
        }
      ];
      const expected = [
        {
          date: '2018-02-25',
          members: [{ role: 'Newsletter', name: 'Joseph Chiang' }]
        }
      ];
      const result = dataReducer(
        state,
        receiveModifyIdEvents({
          date: '2018-02-25',
          role: 'Newsletter',
          name: 'Joseph Chiang'
        })
      );
      expect(result).toEqual(expected);
    });
    it('should be updated by #receiveModifyServiceInfo', () => {
      const state = [
        {
          date: '2018-02-11',
          serviceInfo: {
            footnote: '',
            id: 1,
            skipReason: '',
            skipService: false
          }
        }
      ];
      const expected = [
        {
          date: '2018-02-11',
          serviceInfo: {
            footnote: 'Chinese New Year',
            id: 1,
            skipReason: 'Combined Service',
            skipService: true
          }
        }
      ];
      const result = dataReducer(
        state,
        receiveModifyServiceInfo({
          id: 1,
          serviceInfo: {
            footnote: 'Chinese New Year',
            id: 1,
            skipReason: 'Combined Service',
            skipService: true
          }
        })
      );
      expect(result).toEqual(expected);
    });
    it('should be updated by #setServiceInfo', () => {
      const state = [
        {
          date: '2018-02-11',
          serviceInfo: {
            footnote: '',
            id: 1,
            skipReason: '',
            skipService: false
          }
        }
      ];
      const expected = [
        {
          date: '2018-02-11',
          serviceInfo: {
            footnote: 'Chinese New Year',
            id: 1,
            skipReason: 'Combined Service',
            skipService: true
          }
        }
      ];
      const result = dataReducer(
        state,
        setServiceInfo({
          footnote: 'Chinese New Year',
          id: 1,
          skipReason: 'Combined Service',
          skipService: true
        })
      );
      expect(result).toEqual(expected);
    });
  });

  describe('selectedDataReducer', () => {
    const initState = defaultState.meta.selectedData; // null
    const mockState = {
      day: moment('2018-02-13'),
      role: 'P&W',
      member: 'Jenny Hsu',
      names: ['Aaron Goh']
    };

    it('should have initial state', () => {
      const result = selectedDataReducer(undefined, { type: '...' });
      expect(result).toBe(initState);
    });

    it('should be updated by #setSelectedData', () => {
      const result = selectedDataReducer(initState, setSelectedData(mockState));
      expect(result).toEqual(mockState);
      expect(result).toHaveProperty('day');
      expect(result).toHaveProperty('role');
      expect(result).toHaveProperty('member');
      expect(result).toHaveProperty('names');
    });

    it('should be updated by #toggleEditDay', () => {
      let result = selectedDataReducer(mockState, toggleEditDay(false));
      expect(result).toBeNull();

      result = selectedDataReducer(mockState, toggleEditDay(true));
      expect(result).toEqual(mockState);
    });

    it('should be updated by #toggleEditRole', () => {
      let result = selectedDataReducer(mockState, toggleEditRole(false));
      expect(result).toBeNull();

      result = selectedDataReducer(mockState, toggleEditDay(true));
      expect(result).toEqual(mockState);
    });
  });

  describe('isLoadingReducer', () => {
    xit('should be true when #requestRetrieveEvent is called', () => {
      const state = false;
      const payload = {
        date: '2018-02-25',
        name: 'May Chien',
        role: 'Pianist'
      };
      const result = isLoadingReducer(state, requestRetrieveEvents(payload));
      expect(result).toBeTruthy();
    });
    it('should be false when #receiveRetrieveEvent is called', () => {
      const state = true;
      const result = isLoadingReducer(state, receiveRetrieveEvents({}));
      expect(result).toBeFalsy();
    });
  });

  describe('isSavingReducer', () => {});
});
