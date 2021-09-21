import fetch from "node-fetch";

export const getLichessUser=  async (accessToken) => await fetch('https://lichess.org/api/account',{
    headers: {'Authorization': `Bearer ${accessToken}`}
}).then(res=>res.json());

export const getLichessEmail=  async (accessToken) => await fetch('https://lichess.org/api/account/email',{
    headers: {'Authorization': `Bearer ${accessToken}`}
}).then(res=>res.json());

export let json = [];
export const getFollowing = async (accessToken, username) => await fetch(`https://lichess.org/api/user/${username}/following`,{
    method:'GET',
    headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/x-ndjson'
    }
});

export const readStream = processLine => response => {
    const matcher = /\r?\n/;
    const decoder = new TextDecoder();
    let buf = '';
    return new Promise((resolve, fail) => {
      response.body.on('data', v => {
        const chunk = decoder.decode(v, { stream: true });
        buf += chunk;
  
        const parts = buf.split(matcher);
        buf = parts.pop();
        for (const i of parts.filter(p => p)) processLine(JSON.parse(i));
      });
      response.body.on('end', () => {
        if (buf.length > 0) processLine(JSON.parse(buf));
        resolve();
      });
      response.body.on('error', fail);
    });
  };
export const onMessage = obj => json.push(obj);


