const supertest = require('supertest')
const app = require('../../server/api/app')
const request = supertest(app)
const { clearFieldsInSingleRecord } = require('../../server/data_access_layer/helpers')

const user1ID = 1 // `ID` field in `user` table
const user2Id = 'recaHw82NAck0EquE'
const user2ID = 2
const userBaseName = 'Users'

describe('Checks user answered routes', () => {
  const answeredFieldName = 'Answered'
  let questions
  let questionIDs
  // get the question ids before the tests
  beforeAll(async () => {
    const questionsRes = await request.get('/api/questions')
    expect(questionsRes.status).toBe(200)
    questions = questionsRes.body
    questionIDs = questions.map(question => question.ID)

  })
  // the following test might modify `answered` field of user2
  beforeEach(async () => {
    clearFieldsInSingleRecord(userBaseName, user2Id, answeredFieldName)
  })
  it('should return status 404 when nonexistent userId is given', async () => {
    const res = await request.get(`/api/user/${-1}/answered`)
    expect(res.status).toBe(404)
  })
  // assume user1 always have at least one answered questions
  it('should return the nonempty array of the answered questions of user1', async () => {
    const res = await request.get(`/api/user/${user1ID}/answered`)
    expect(res.status).toBe(200)
    const answeredQuestions = res.body
    expect(res.body.length).toBeGreaterThan(0)
    // check if each of the recordId is one existing questionId
    answeredQuestions.forEach(question => expect(questionIDs.includes(question.ID)).toBe(true))
  })
  it('should return the empty array of the answered questions of user2', async () => {
    const res = await request.get(`/api/user/${user2ID}/answered`)
    expect(res.status).toBe(200)
    expect(res.body.length).toBe(0)
  })
  it('should return updated ids of the answered questions when multiple questions are added sequentially', async () => {
    let res
    res = await request.get(`/api/user/${user2ID}/answered`)
    expect(res.status).toBe(200)
    expect(res.body.length).toBe(0)
    let numOfQuestionsAdded = Math.min(4, questions.length)
    for (let i = 0; i < numOfQuestionsAdded; ++i) {
      res = await request.post(`/api/user/${user2ID}/answer`).send({ questionId: questionIDs[i]})
      expect(res.status).toBe(200)
    }
    setTimeout(async () => {
      res = await request.get(`/api/user/${user2ID}/answered`)
      expect(res.status).toBe(200)
      expect(res.body.length).toBe(numOfQuestionsAdded)
      let answered = res.body.Answered
      answered.forEach((question, index) => {
        expect(question.ID == questions[index]) 
      })
    }, (3)) // needs a little time for the change go through the DB
  })
  it('should return updated user w/ new question in answered field', async () => {
    let res
    res = await request.get(`/api/user/${user2ID}/answered`)
    expect(res.status).toBe(200)
    res = await request.post(`/api/user/${user2ID}/answer`).send({ questionId: questionIDs[7]})
    expect(res.status).toBe(200)
    setTimeout(async () => {
      res = await request.get(`/api/user/${user2ID}/answered`)
      expect(res.status).toBe(200)
      expect(res.body.length).toBe(1)
      let answered = res.body.Answered
      expect(answered.includes(questions[7]))
    }, (3)) // needs a little time for the change go through the DB
  })
  afterAll(async () => {
    clearFieldsInSingleRecord(userBaseName, user2Id, answeredFieldName)
    
  })
})

describe('Checks to see if user route returns the first user data successfully', () => {
  it('should print the first user data if successful', async () => {
    const res = await request.get('/api/user/1')

    expect(res.body['Full Name']).toMatch('Aliya Petranik')
    expect(res.body['Email']).toMatch('petranik@usc.edu')
    expect(res.body['Current Title']).toMatch('Tech Lead')
    expect(res.status).toBe(200)
  })
})

describe('Checks to see if Full Name/Email/Current Title/Answered members exist for returned value', () => {
  it('should print user data if successful', async () => {
    const res = await request.get('/api/user/1')
    var keys = Object.keys(res.body)
    expect(keys[0]).toMatch('_record')
    expect(keys[1]).toMatch('Current Title')
    expect(keys[3]).toMatch('Full Name')
    expect(keys[4]).toMatch('Company')
    expect(keys[5]).toMatch('Email')
    expect(keys[6]).toMatch('ID')
    expect(keys[7]).toMatch('Answered')
    expect(res.status).toBe(200)
  })
})

describe('Checks to see if invalid url is handled', () => {
  it('should return a 404 error', async () => {
    const res = await request.get('/api/users/1')
    expect(res.status).toBe(404)
  })
})

describe('Checks to see if invalid user code is handled', () => {
  it('should return a 404 error', async () => {
    const res = await request.get('/api/user/999')
    expect(res.status).toBe(404)
  })
})
