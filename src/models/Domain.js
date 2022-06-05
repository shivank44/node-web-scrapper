const { Model } = require('objection');

class Domain extends Model {
    // Table name is the only required property.
    static get tableName() {
      return 'domains';
    }

    static get relationMappings() {
        const DomainLink = require('./DomainLink');
        return {
            domainLinks: {
                relation: Model.HasManyRelation,
                modelClass: DomainLink,
                join: {
                    from: 'domain_links.domain_id',
                    to: 'domains.id',
                }
            }
        }
    }
      
      $formatJson(json, opt) {
        json = super.$formatJson(json, opt);
        return json
    }


    async $beforeInsert() {
        await super.$beforeInsert();
    }

    async $beforeUpdate() {
        await super.$beforeUpdate();
    }

}

module.exports = Domain;