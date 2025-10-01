const createResponse = (data, message, status, is_list = false, pagination = {}) => {
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

  return responseObject;
};

module.exports = {
  createResponse,
};