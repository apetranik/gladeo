const supertest = require('supertest')
const app = require('../../server/api/app')
const request = supertest(app)

describe('Checks to see if questions route returns the list of questions', () => {
  it('should print questions in json format when request is successful', async () => {
    const res = await request.get('/api/questions')
    expect(res.status).toBe(200)
    expect(res.body.length).toBeGreaterThan(8)
  })
})

describe('Checks to see if an invalid route is handled', () => {
  it('should return 404 error when invalid url is used', async () => {
    const res = await request.get('/api/invalidurl')
    expect(res.status).toBe(404)
  })
})

describe('Checks if first question returned matches the desired string', () => {
  it('should print questions in json format when request is successful', async () => {
    const res = await request.get('/api/questions')
    expect(res.status).toBe(200)
    expect(res.body[0].text).toMatch('Who/what influenced or inspired you to do what you do?')
  })
})

describe('Checks to see if all field members exist for each question', () => {
  it('should print questions in json format when request is successful', async () => {
    const res = await request.get('/api/questions')
    expect(res.status).toBe(200)
    for (var i = 0; i < res.body.length; i++) {
      var keys = Object.keys(res.body[i])
      expect(keys[0]).toMatch('_record')
      expect(keys[1]).toMatch('text')
      expect(keys[2]).toMatch('ID')
    }
  })
})
