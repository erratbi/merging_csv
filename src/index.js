import express from 'express';
import request from 'request-promise';
import cheerio from 'cheerio';




const app = express();
const PORT = 3001


app.get('/watch/:slug', async (req, res) => {
    let uri = `https://hd-arab.com/${req.params.slug}/`;
    let $ = await request({ uri, transform: body => cheerio.load(body) });
    uri = $('#player_1 iframe').data('src');
    const soup = await request({ uri });

    uri = eval(/(sources: \[.+\])/gi.exec(soup)[1])[1].file;

    try {
        const data = await request({ uri,followRedirect: false,resolveWithFullResponse: true  })
    } catch (error) {
        uri = error.response.headers.location;
        await request({ uri, headers: req.headers  }).pipe(res);
    }

});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
