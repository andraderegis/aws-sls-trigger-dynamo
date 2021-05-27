const uuid = require('uuid')

class Handler {
  constructor({ databaseService }) {
    this.databaseService = databaseService;
    this.dynamoDBTable = process.env.DYNAMODB_TABLE;
  }

  async main(event) {
    try {
      const data = JSON.parse(event.body);
      const dbParams = this.prepareData(data);

      await this.insertItem(dbParams);

      return this.handerSuccess(dbParams.Item);
    } catch (error) {
      console.error('Error****', error.stack);

      return this.handlerError({ statusCode: 500 });
    }
  }

  prepareData(data) {
    return {
      TableName: this.dynamoDBTable,
      Item: {
        ...data,
        id: uuid.v4(),
        createdAt: new Date().toISOString()
      }
    }
  }

  async insertItem(params) {
    return this.databaseService.put(params).promise();
  }

  handerSuccess(data) {
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    }
  }

  handlerError(data) {
    return {
      statusCode: data.statusCode || 501,
      headers: {
        'Content-Type': 'text/plain'
      },
      body: 'Couldn\'t create item.'
    }
  }
}

//factory
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const handler = new Handler({
  databaseService: dynamoDB
});

module.exports = handler.main.bind(handler);