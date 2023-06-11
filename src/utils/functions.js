exports.increasedInvoiceFunc =  function(taxNumber, countNum=1){
  console.log("ABC", taxNumber)
  let invoiceType = taxNumber?.match(/[a-zA-Z]+/g)[0]
  let numbers = taxNumber?.split(invoiceType)[1]
  numbers = numbers?.split('')
  let numberStr =  []
  let countNumData = countNum
  for (let i = numbers?.length -1 ; i >= 0; i--) {
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


exports.calculateTax = (totalAmount,percent,...type) => {
    let AmountObj = {
      IGST:0,
      CGST:0,
      SGST:0,
      GRAND_TOTAL:0
    }
    let amount = totalAmount
    type.forEach(ele=>{
     let perAmount =  this.percentage(percent,totalAmount)
     amount += perAmount
     AmountObj[ele.toUpperCase()] = perAmount
    })
    AmountObj['GRAND_TOTAL'] = Number(amount.toFixed(3))
    return AmountObj
    }