const router = require('express').Router();
const {APIHandler} = require('../responseHandlers')
const {FindListFromDB} = require('../../common/RequestDataFinders')
const {ProcessorWithFilter} = require('../../common/RequestProcessors')
const {AddMessagesProcessor} = require('../../message/RequestProcessors')

const Message = require('../../message/MessageModel')


router.get('/', APIHandler({
   finder: new FindListFromDB().setModel(Message),
   processor: new class extends ProcessorWithFilter{
      async process(data, req) {

         const query = JSON.parse(JSON.stringify(req.query))

         delete query.fields

         if (query.uid) data = data.filter(item => item.uid === query.uid)
         if (query.sender) data = data.filter(item => item.sender === query.sender)

         return super.process(data, req);
      }
   }
}));


router.post('/', APIHandler({
   processor: new AddMessagesProcessor()
}))

module.exports = router