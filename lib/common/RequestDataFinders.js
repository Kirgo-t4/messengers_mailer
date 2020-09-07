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

    conditions(req) {
        return this._args.conditions
    }

    async find(req) {
        const {populate} = this._args
        const conditions = this.conditions(req)
        let result = await this._model.find({...conditions})

        if (populate && result) {
            await Promise.all(result.map(async (item) => await item.populate({path: populate}).execPopulate()))
        }
        return result
    }
}


module.exports = {Finder, FindFromDB, FindListFromDB}