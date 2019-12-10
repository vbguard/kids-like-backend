const getNextWeekDay = (todayDate) => {
    if(!(todayDate instanceof Date)) return null;
    const getFullDay = todayDate.toISOString().split('T')[0];
    const dateToUTC=getFullDay.split('-');
    const fromDateStringToUTCDate= new Date(Date.UTC(+dateToUTC[0],+dateToUTC[1]-1,+dateToUTC[2], 0, 0, 0));
    const nextWeekDay = fromDateStringToUTCDate.getTime() + 7*24*60*60*1000;
    return new Date(nextWeekDay);
  };

  module.exports = getNextWeekDay;
