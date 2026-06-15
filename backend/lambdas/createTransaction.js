const { v4: uuidv4 } = require("uuid");

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);

    const transaction = {
      transactionId: uuidv4(),
      symbol: body.symbol,
      units: body.units,
      buyPrice: body.buyPrice,
      buyDate: body.buyDate,
      createdAt: new Date().toISOString()
    };

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "Transaction created",
        data: transaction
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message
      })
    };
  }
};