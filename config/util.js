module.exports = {
    async generateBillingCycleDates(startDate, periodType, numberOfOccurrences) {
        const billingCycleDates = [];
        let currentDate = new Date(startDate);

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

        let billingCycleDatesStrings = billingCycleDates.map(val => {
            date = new Date(val);
            return date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear();
        })

        return console.log(billingCycleDatesStrings);
    },
    replaceVariableWithValue(stringToReplace, payload) {
        console.log(payload)
        let str = stringToReplace;
        let variablesData = str?.match(/<([^>]+)>/g);
        let variablesKeyData = [];
        variablesData?.forEach((variableKey) => {
          let variableName = variableKey?.replace(/<|>/g, "");
          let keyObj = {
            [variableKey]: payload[variableName],
          };
          variablesKeyData.push(keyObj);
        });
        variablesKeyData.forEach((ele) => {
          let key = Object.keys(ele);
          str = str.replace(key, ele[key]);
        });
        return str;
      }
}

