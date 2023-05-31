exports.increasedInvoiceFunc =  function(taxNumber,countNum=1){
    let invoiceType = taxNumber.match(/[a-zA-Z]+/g)[0]
  let numbers = taxNumber.split(invoiceType)[1]
  numbers = numbers.split('')
  let numberStr =  []
  let countNumData = countNum
  for (let i = numbers.length -1 ; i >= 0; i--) {
        let num =  Number(numbers[i])
        num += countNumData
        if(i === 0){
            numberStr.push(num)
        }
        else if(num===10){
          countNumData = 1
          numberStr.push(0)
        }else{
          numberStr.push(num)
          countNumData = 0
        }
  }
  numberStr.push(invoiceType)
  numberStr = numberStr.reverse().join("")
  return numberStr
  }
  
  exports.billDateStr = (date) => {
    const months = [ "January","February","March","April","May","June","July","August","September","October","November","December",];
    let currentDate= new Date(date)
    let day = currentDate.getDay()
    let getMonth = months[currentDate.getMonth()] 
    let year = currentDate.getFullYear()
    let dateStr = `${day} ${getMonth} ${year}`
    return dateStr
  }
  exports.percentage = (percent, total) => {
    return Number(((Number(percent)/ 100) * Number(total)).toFixed(2))
  }
  
  exports.replaceVariableWithValue = (newStr="", data) => {
    let str = newStr;
    if(str===""){
      return ""
    }
    console.log("HEY", data);
    let variablesData = str.match(/<([^>]+)>/g);
    let variablesKeyData = [];
    console.log(variablesData)
    variablesData?.forEach((variableKey) => {
      let variableName = variableKey.replace(/<|>/g, "");
      let keyObj = {
        [variableKey]: data[variableName],
      };
      variablesKeyData.push(keyObj);
    });
    variablesKeyData.forEach((ele) => {
      let key = Object.keys(ele);
      str = str.replace(key, ele[key]);
    });
    return str;
  };
  
  exports.generateBillingCycleDates = (startDate, periodType, numberOfOccurrences) => {
    const billingCycleDates = [];
    let currentDate = new Date(startDate);
  
    for (let i = 0; i < numberOfOccurrences; i++) {
      billingCycleDates.push(new Date(currentDate));
      if (periodType === 'monthly') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      } else if (periodType === 'quarterly') {
        currentDate.setMonth(currentDate.getMonth() + 3);
      } else if (periodType === 'weekly') {
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (periodType === 'yearly') {
        currentDate.setFullYear(currentDate.getFullYear() + 1);
      }
    }
  
    let billingCycleDatesStrings =  billingCycleDates.map(val =>{
      date = new Date(val);
      return date.getDate()+'-' + (date.getMonth()+1) + '-'+date.getFullYear();
    })
    return billingCycleDatesStrings;
  }
  
  const dateFormat = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const formattedDate = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
    return formattedDate;
  };
  
  exports.generateBillingCycleDates = (startDate, periodType, numberOfOccurrences) => {
    console.log(startDate, periodType, numberOfOccurrences,"test")
    let billingCycleDates = [];
    let currentDate = new Date(startDate);
    currentDate.setMonth(currentDate.getMonth() + 1)
  
    for (let i = 0; i < numberOfOccurrences; i++) {
      billingCycleDates.push(new Date(currentDate));
      if (periodType === 'MONTHLY') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      } else if (periodType === 'QUATERLY') {
        currentDate.setMonth(currentDate.getMonth() + 3);
      } else if (periodType === 'WEEKLY') {
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (periodType === 'YEARLY') {
        currentDate.setFullYear(currentDate.getFullYear() + 1);
      }
    }
    console.log(billingCycleDates,"billingCycleDates")
  
    billingCycleDates = billingCycleDates.map((e)=>dateFormat(e))
  
    return billingCycleDates
  }
  
  const getOrdinalNumber = (number) => {
    if (number === 1) {
      return number + 'st';
    } else if (number === 2) {
      return number + 'nd';
    } else if (number === 3) {
      return number + 'rd';
    } else {
      return number + 'th';
    }
  }
  let monthsArr = ['Jan', 'Feb', 'Mar', 'Apr',  'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];
  
  exports.timePeriodString = (date1,date2) => {
    let [month, day, year] = new Date(date1).toLocaleDateString().split("/")
    console.log(month,day,year)
    var dateObj = new Date(date2);                     
        dateObj.setDate(dateObj.getDate() - 1);
    let [nextMonth, nextDay,nextYear] = dateObj.toLocaleDateString().split("/")
    let str = `${getOrdinalNumber(Number(day))} ${monthsArr[Number(month)-1]}, ${year} to ${getOrdinalNumber(Number(nextDay))} ${monthsArr[Number(nextMonth)-1]} ${nextYear}`
    return str
  }