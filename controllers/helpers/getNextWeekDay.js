const getNextWeekDay = (todayDate) => {
    // console.log('getNextWeekDay')
    // console.log('todayDate', todayDate);
    // console.log('todayDate instanceof Date', todayDate instanceof Date);
    if(!(todayDate instanceof Date)) return null;
    // console.log('todayDate.toISOString()', todayDate.toISOString());
    // console.log('typeof todayDate.toISOString()', typeof todayDate.toISOString());
    const getFullDay = todayDate.toISOString().split('T')[0];
    // console.log('getFullDay', getFullDay);
    // console.log('typeof getFullDay', typeof getFullDay);
    const dateToUTC=getFullDay.split('-');
    const fromDateStringToUTCDate= new Date(Date.UTC(+dateToUTC[0],+dateToUTC[1]-1,+dateToUTC[2], 0, 0, 0));
    // console.log('fromDateStringToUTCDate', fromDateStringToUTCDate);
    // console.log('typeof fromDateStringToUTCDate', typeof fromDateStringToUTCDate);
    // console.log('Date.now(fromDateStringToUTCDate)', Date.now(fromDateStringToUTCDate));
    // console.log('typeof Date.now(fromDateStringToUTCDate)', typeof Date.now(fromDateStringToUTCDate));
    const nextWeekDay = fromDateStringToUTCDate.getTime() + 7*24*60*60*1000;
    // console.log('new Date(nextWeekDay)', new Date(nextWeekDay));
    // console.log('typeof new Date(nexWeekDay)', typeof new Date(nexWeekDay));
    return new Date(nextWeekDay);
  };

  module.exports = getNextWeekDay;
