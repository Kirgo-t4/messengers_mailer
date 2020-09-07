const splitFirst = (s, delimiter) => {
    const splited = s.split(delimiter)
    const [first, ...rest] = splited
    return [first, rest.join(delimiter)]
}


const filterObj = (source, allowed) => {

    return Object.keys(source).filter(key => {
        if (typeof source[key] === 'object') {
            //Ищем есть ли в массиве разрешенных значений данный ключ
            const allowed_keys = allowed.filter(allowed_key => allowed_key === key || allowed_key.split('.', 2)[0] === key)
            return allowed_keys.length;

        }
        return allowed.includes(key)
    }).reduce((obj, key) => {
            if (typeof source[key] === 'object') {
                const allowed_keys = allowed.filter(allowed_key => allowed_key === key)
                if (allowed_keys.length) {
                    obj[key] = source[key]
                } else {
                    const allowed_subkeys = allowed
                        .filter(allowed_key => splitFirst(allowed_key, '.')[1])
                        .map(allowed_key => splitFirst(allowed_key, '.')[1])
                    if (source[key] instanceof Array) {
                        obj[key] = source[key].map(item => filterObj(item, allowed_subkeys))
                    }
                    else if (typeof source[key] === 'object') {
                        obj[key] = filterObj(source[key], allowed_subkeys)
                    }
                }
            } else {
                obj[key] = source[key]
            }
            return obj
        }, {})
}

class Processor {
    constructor(args = {}) {
        this._mess404 = args.mess404 || "404 not found"
    }

    async process(data, req) {
        throw new Error("Not Implemented")
    }
}


class ProcessorWithFilter extends Processor {

    getAllowed(req) {
        return req.query.fields && req.query.fields.split(',')
    }

    async process(data, req) {
        const allowed = this.getAllowed(req)

        if (!data) {
            return {
                message: this._mess404,
                error_code: 404
            }
        }
        let result_
        if (data instanceof Array) {
            // result_ = typeof data.toObject === 'function' ? data.toObject() : result_
            result_ = data.map((item) => {
                item = typeof item.toObject === 'function' ? {...item.toObject()} : {...item}
                return allowed ? filterObj(item, allowed) : item
            }).filter(item => Object.keys(item).length)
        } else {
            result_ = typeof data.toObject === 'function' ? {...data.toObject()} : {...data}
            result_ = allowed ? filterObj(result_, allowed) : result_
        }

        return {
            result: result_,
            error_code: 0
        }
    }
}

class ProcessorToDelete extends Processor {
    async process(data, req) {
        if (!data) {
            return {
                message: "404 not found",
                error_code: 404
            }
        }
        await data.remove()

        return {
            result: "Successfully delete",
            error_code: 0
        }
    }
}

class ProcessorToDeleteWithChecker extends ProcessorToDelete {

    constructor(args) {
        super(args);
        this._Model = args.Model
        this._field = args.field
    }

    async process(data, req) {
        const {_Model, _field} = this
        if (data && await _Model.exists({[_field]: data._id})) {
            return {
                message: `There are campaigns linked to this ${_field}`,
                error_code: 400
            }
        }
        return await super.process(data, req)
    }
}


module.exports = {Processor, ProcessorWithFilter, ProcessorToDelete, ProcessorToDeleteWithChecker}