const getQueryParams = (req) => ({
  q: req.query.q,
  page: req.query.page ? parseInt(req.query.page, 10) : 0,
  limit: req.query.limit ? parseInt(req.query.limit, 10) : 0,
});

export default getQueryParams;
