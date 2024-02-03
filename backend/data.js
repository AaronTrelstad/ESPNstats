const puppeteer = require('puppeteer');
const { MongoClient } = require('mongodb');

const scrapeESPN = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    //Make multipte pages

    const uri = 'mongodb://localhost:27017';
    const client = new MongoClient(uri);

    try {
        await client.connect();

        const db = client.db('NCAAdata');
        const collection = db.collection('NCAAstats');
        await collection.deleteMany({});

        await page.goto('https://www.espn.com/mens-college-basketball/teams', { waitUntil: 'domcontentloaded'});

        const rosterLinks = await page.$$eval('.AnchorLink[href*="/team/roster/"]', (links) => {
            return links.map((link) => link.href);
        }); 

        const teams = await page.$$eval('.di.clr-gray-01.h5', (names) => {
            return names.map((name) => name.innerText.trim());
        })

        for (let i = 0; i < rosterLinks.length; i++) {
            if (teams[i]) {
                await getPlayers(browser, client, rosterLinks[i], teams[i]);
            }   
        }
    }
    catch(error) {
        console.log("error", error);
    }
    finally {
        await browser.close();
        await client.close();
    }
};

const getPlayers = async ( browser, mongoDBclient, rosterLink, teamName ) => {
    const page = await browser.newPage();
    const client = mongoDBclient

    try {
        await page.goto(rosterLink, { waitUntil: 'domcontentloaded'});

        const team = teamName;

        const playersLinks = await page.$$eval('.AnchorLink[href*="/player/"]', (links) => {
            return links
                .filter((link) => link.innerText.trim().length > 0)
                .map((link) => link.href);
        });

        for (let i = 0; i < playersLinks.length; i++) {
            await getStats(browser, client, playersLinks[i], team);
        }

    } catch (error) {
        console.log(error);
    }
    finally {
        if (page && !page.isClosed()) {
            await page.close();
        }
    }
}

const getStats = async ( browser, mongoDBclient, playerLink, teamName ) => {
    const page = await browser.newPage();
    const client = mongoDBclient;

    try {
        await page.goto(playerLink, { waitUntil: 'domcontentloaded'});

        const parts = playerLink.split('/');
        let name = parts[parts.length - 1];
        name = name.replaceAll('-', ' ');

        const team = teamName;

        const grade = await page.$eval('.fw-medium.clr-black', (player) => {
            return player.innerText.trim();
        });

        if (grade.includes("")) {
            const playerStats = await page.$$eval('.clr-gray-02', (stats) => {
                const trimmedStats = stats.map(stat => stat.innerText.trim());
                if (trimmedStats.length == 0) {
                    return "Has not played";
                }
                return trimmedStats.slice(0, 4);
            });

            const playerData = {
                name: name,
                grade: grade,
                team: team,
                stats: playerStats
            };

            console.log(playerData);
            const db = client.db('NCAAdata');
            const collection = db.collection('NCAAstats');
            await collection.insertOne(playerData);
        }  
    }
    catch(error) {
        console.log("error", error);
    }
    finally {
        if (page && !page.isClosed()) {
            await page.close();
        }
    }
}

scrapeESPN();

