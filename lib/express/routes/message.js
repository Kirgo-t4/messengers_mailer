const router = require('express').Router();
const {APIHandler} = require('../responseHandlers')
const {FindPartialListFromDB, FindFromDB} = require('../../common/RequestDataFinders')
const {ProcessorWithFilter} = require('../../common/RequestProcessors')
const {AddMessagesProcessor} = require('../../message/RequestProcessors')

const Message = require('../../message/MessageModel')


router.get('/', APIHandler({
   finder: new FindPartialListFromDB().setModel(Message).setDefaultSort({creation_date: 'desc'}),
   processor: new class extends ProcessorWithFilter{
      async process(data, req) {
         const query = JSON.parse(JSON.stringify(req.query))
         const __count__ = data.__count__
         delete query.fields

         if (query.uid) data = data.filter(item => item.uid && item.uid.toString() === query.uid.toString())
         if (query.sender) data = data.filter(item => item.sender === query.sender)

         data.__count__ = __count__

         return super.process(data, req);
      }
   }
}));

router.get('/:id', APIHandler({
   finder: new FindFromDB().setModel(Message),
   processor: new ProcessorWithFilter()
}))


router.post('/', APIHandler({
   processor: new AddMessagesProcessor()
}))

module.exports = router