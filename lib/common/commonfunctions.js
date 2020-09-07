
async function findByIdOrOtherField(Model, field, value) {
    const strValue = value.toString()
    return strValue.match(/^[0-9a-fA-F]{24}$/) ?
        await Model.findOne({_id: strValue}) :
        await Model.findOne({[field]: strValue})
}

const expiredDate = (limit) => (new Date(new Date() - limit))

async function pause(sec) {
    return new Promise((resolve) => {setTimeout(resolve, sec*1000)})
}


module.exports = {findByIdOrOtherField, expiredDate, pause}