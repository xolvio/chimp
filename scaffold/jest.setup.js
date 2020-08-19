const td = require('testdouble')
require('testdouble-jest')(td, jest)

process.env.TEST_ENV = "true"
