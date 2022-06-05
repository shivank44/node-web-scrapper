const { Model } = require('objection');

class DomainLink extends Model {
    // Table name is the only required property.
    static get tableName() {
      return 'domain_links';
    }

    static get relationMappings() {
        const Domain = require('./Domain');
        return {
            domain: {
                relation: Model.HasOneRelation,
                modelClass: Domain,
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

module.exports = DomainLink;