import express from "express";
import session from "express-session";
import fetch from "node-fetch";
import { createChallenge, createVerifier } from "./utils/auth.js";
import { json, readStream, onMessage ,getFollowing, getLichessEmail, getLichessUser } from "./utils/utils.js";

const port = 3000;
const hostURL = 'https://lichess.org';
const clientID = 'Pixemy';
const clientUrl = 'http://localhost:3000';
const secret = 'BetterEdSecret'
const app = express();
const following = [];

app.use(session({secret:secret, saveUninitialized:true, resave:true}));

app.get('/', async(req, res)=>{
    const verifier = createVerifier();
    const challenge = createChallenge(verifier) ;
    req.session.codeVerifier = verifier;
    const authURL = `${hostURL}/oauth?` + new URLSearchParams({
        response_type: 'code', 
        client_id: clientID, 
        redirect_uri: `${clientUrl}/homepage`,
        scope: 'email:read', 
        code_challenge_method: 'S256',
        code_challenge: challenge,
        state:'qwertyuiop'
    })
    res.send(`
    <h1> Lichess Client Side </h1>
    <p> To <em>Sign in</em> or <em>Sign Up</em></p>
    <a href="${authURL}"><button>Click here</button></a>
    `)
})

const getLichessToken = async (authCode, verifier, url, scope='email:read') => await fetch(`${hostURL}/api/token`, {
    method: 'POST',
    headers:{'Content-Type': 'application/json'},
    body: JSON.stringify({
        grant_type: 'authorization_code',
        redirect_uri:`${url}`,
        client_id:clientID,
        code:authCode, 
        code_verifier: verifier, 
        scope:scope
    })
}).then(res=>res.json());

app.get('/homepage', async (req, res)=>{
    const verifier = req.session.codeVerifier;

    const lichessToken = await getLichessToken(req.query.code, verifier, `${clientUrl}/homepage`, 'follow:write')
    const lichessUser = await getLichessUser(lichessToken.access_token)
    const lichessUserEmail = await getLichessEmail(lichessToken.access_token)
    await getFollowing(lichessToken.access_token, lichessUser.username).then(readStream(onMessage));
    json.forEach(i => following.push(i.username))
    res.send(`
    Logged in as : <strong>${lichessUser.username}</strong>,
    Email is <em>${lichessUserEmail.email}</em>!
    <hr>
    <div>${JSON.stringify(lichessUser)}</div>
    <hr>
    Following: <em> ${String(following)} </em>
    `)
  })
  app.listen(port)
