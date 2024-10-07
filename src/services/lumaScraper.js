// scraper.js
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import moment from 'moment';

export async function scrapeLumaCalendar(calendarUrl) {
  try {
    const response = await fetch(calendarUrl, {
      headers: {
        'User-Agent': 'LumaCalendar-to-DiscordChannel (me@juliet.tech)'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const dom = cheerio.load(html);

    let calendarData;
    const scripts = dom('script').toArray();
    for (const script of scripts) {
      const content = script.children[0]?.data || '';
      if (content.includes('pageProps') && content.includes('initialData')) {
        calendarData = content;
        break;
      }
    }

    if (!calendarData) {
      throw new Error('Calendar data not found in page');
    }

    const jsonDataMatch = calendarData.match(/({.+})/);
    if (!jsonDataMatch) {
      console.log('Debug: Calendar data content:', calendarData.substring(0, 500) + '...');
      throw new Error('Could not extract JSON data from script. This is the calendar data content:', calendarData.substring(0, 500) + '...' );
    }

    const parsedData = JSON.parse(jsonDataMatch[1]);
    const featuredItems = parsedData.props.pageProps.initialData.data.featured_items || [];

    const today = moment().startOf('day');;
    const todayEvents = featuredItems
      .filter(item =>
        item.event &&
        moment(item.event.start_at).isSame(today, 'day')
      )
      .map(item => ({
        title: item.event.name,
        startTime: moment(item.event.start_at).format('h:mm A'),
        url: `https://lu.ma/${item.event.url}`,
        description: item.event.description || null,
        address: item.event.geo_address_info?.address || 'No address provided',
        hosts: item.hosts?.map(host => host.name).join(', ') || 'No host information'
      }));

    return todayEvents;
  } catch (error) {
    console.error('Error scraping Luma calendar:', error.message);
    return [];
  }
}
