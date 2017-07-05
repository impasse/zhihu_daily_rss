const _ = require('lodash');
const path = require('path');
const pug = require('pug');
const Promise = require('bluebird');
const redis = require('ioredis')();
const request = require('request-promise');

async function fetch() {
    const list = await request({ uri: 'https://news-at.zhihu.com/api/4/stories/latest', json: true });
    return _.assign(list, {
        stories: await Promise.map(_.get(list, 'stories', []), async item => _.assign(item, await request({ uri: `https://news-at.zhihu.com/api/4/story/${item.id}`, json: true }))),
    });
}

const rssTpl = pug.compileFile(path.resolve(__dirname, 'rss.pug'));

async function getRss() {
    const storedRawList = await redis.get('daily_list');
    let list;
    if (storedRawList) {
        list = JSON.parse(storedRawList);
    } else {
        list = await fetch();
        await redis.set('daily_list', JSON.stringify(list), 'ex', 60 * 15);
    }
    return rssTpl(list);
}

module.exports = {
    getRss,
};


if (module === require.main) {
    (async function () {
        try {
            // const list = await fetch();
            // const fs = require('fs');
            // fs.writeFileSync('test.json', JSON.stringify(list));
            console.log(await getRss());
            require('process').exit(0);
        } catch (e) {
            console.error(e);
        }
    })();
}