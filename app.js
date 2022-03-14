const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const uri = process.env.DATABSE_URL 

app.get('/', (req, res) => {
  console.log(uri)
  res.send('Hello World!')
})



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
  console.log('spec3')
})