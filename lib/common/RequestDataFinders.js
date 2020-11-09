const {findByIdOrOtherField} = require('../common/commonfunctions')

class Finder {
    constructor(args) {
        this._args = args || {}
    }

    async find(args) {
        throw new Error("Not Implemented")
    }
}

class FindFromDB extends Finder {
    constructor(args) {
        super(args);
    }

    setModel(model) {
        this._model = model
        return this
    }

    getId(req) {
        return req.params.id
    }

    async find(req) {
        let {idAlias, populate} = this._args
        const model = this._model
        const id = this.getId(req)
        idAlias = idAlias || null
        let result = await findByIdOrOtherField(model, idAlias, id)

        if (populate && result) {
            await result.populate({path: populate}).execPopulate()
        }
        return result
    }

}

class FindListFromDB extends FindFromDB {

    filterUser(data, user_id) {
        return data
    }

    async find(req) {
        const {conditions, populate} = this._args
        let result = await this._model.find({...conditions})

        result = this.filterUser(result, req.uid)

        if (populate && result) {
            await Promise.all(result.map(async (item) => await item.populate({path: populate}).execPopulate()))
        }

        result.__count__ = result.length

        return result
    }
}

class FindPartialListFromDB extends FindListFromDB {

    setDefaultSort(sort) {
        this._sort = sort
        return this
    }

    async find(req) {
        const {conditions, populate} = this._args

        let {limit, skip, sort, sortorder} = req.query

        let sortObj = sort ? { [sort]: parseInt(sortorder) || 1} : this._sort

        let result = await this._model.find({...conditions}).sort(sortObj).skip(parseInt(skip)).limit(parseInt(limit))

        result = this.filterUser(result, req.uid)

        result.__count__ = await this._model.countDocuments(req.query.uid ? {...conditions, uid: req.query.uid} : {...conditions})

        if (populate && result) {
            await Promise.all(result.map(async (item) => await item.populate({path: populate}).execPopulate()))
        }
        return result
    }
}


module.exports = {Finder, FindFromDB, FindListFromDB, FindPartialListFromDB}