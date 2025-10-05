const createResponse = (data, message, status, is_list = false, pagination = {}, err = null) => {
  const responseObject = {
    data,
    message,
    status,
  }

  if (is_list) {
    responseObject.pagination = {
      total: pagination.total,
      limit: pagination.limit,
      offset: pagination.offset,
    };
  }

  if (err) {
    responseObject.error = err
  }

  return responseObject;
};

module.exports = {
  createResponse,
};