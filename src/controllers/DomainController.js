const puppeteer = require("puppeteer");
const Domain = require("../models/Domain");
const DomainLink = require("../models/DomainLink");
const SendEmail = require("../modules/Transporter").SendEmail;
require('dotenv').config();

const add = async (req,res) => {
  try{
    const website = req.query.domain;

    if (!website) {
      const err = new Error("Required query website missing");
      err.status = 400;
      next(err);
    }

    const domain = await Domain.query().upsertGraph({
        domain : website
    });

    Promise.all([
      scrap(website,domain,process.env.ROOT_URL)
    ]);
    //await scrap(website,domain);

    return res.redirect(`/domain/${domain.id}`);
    
  }catch(err){
    let errMessage = err.message ? err.message : err[0].message;
    res.status(500).json ({ error : errMessage });
  }

}

const addLink = async (req,res) => {
    try{
      let data = req.body;
  
      const domainLink = await DomainLink.query().upsertGraph(data).returning('*');
  
      return res.status(201).json({
          result : domainLink,
          message : "Domain Link added successfully"
      })
  
    }catch(err){
      let errMessage = err.message ? err.message : err[0].message;
      res.status(500).json ({ error : errMessage });
    }
  
  }


const getAll = async (req,res) => {
  try{
        const domains = await Domain.query().select('*')
        .withGraphFetched('[domainLinks]')
        .modifyGraph('domainLinks',(builder) => { builder.select('id','link','word_count') })
        .where('is_delete','0')
        .orderBy('id','DESC');

        if(domains){
          for(let domain of domains){
            let word_count = 0;
            for(let link of domain.domainLinks){
              word_count += link.word_count;
            }
            domain.word_count = word_count;
          }
        }
        res.render("domain",{domains});

  }catch(err){
    let errMessage = err.message ? err.message : err[0].message;
    res.status(500).json ({ error : errMessage });
  }
}

const getOne = async (req,res) => {
  let domain_id = req.params.id;
  try{
        const domains = await DomainLink.query().select('*')
        .where('domain_id',domain_id)
        .orderBy('id','DESC');

        res.render("links",{domains});

  }catch(err){
    let errMessage = err.message ? err.message : err[0].message;
    res.status(500).json ({ error : errMessage });
  }
}

  const deleted = async (req,res) => {
    try{
        
        let id = req.params.id;

          const domain = await Domain.query()
                                        .patch({"is_delete": "1"})
                                        .where("id",id)
                                        .returning('*');
  
          return res.status(201).json({
              result : domain,
              message : "Domain deleted successfully"
          });
  
    }catch(err){
      let errMessage = err.message ? err.message : err[0].message;
      res.status(500).json ({ error : errMessage });
    }
  }

  async function scrap(website,domain,root_url){
    try {
      const browser = await puppeteer.launch();
  
      const registry = {};
      let data = [];
      var queue = [website];
      //let i=0;
      while (queue.length > 0) {
        let url = queue[queue.length - 1];
        
        console.log("current url", url);
        var res = url.charAt(url.length-1);
        if(res == '/'){
          url = url.slice(0, -1);
        }

        const domain_links = await DomainLink.query().select('id')
        .where('domain_id',domain.id)
        .where('link',url)
        .first();

        if(domain_links){
          queue.pop();
          continue;
        }

        let blockstrings = [".pdf",".docx",".xlsx","?","#"];
        if (blockstrings.some(v => url.includes(v))) {
          // There's at least one
          queue.pop();
          continue;
        }
        
        const page = await browser.newPage();
  
      //   if(url.includes(".pdf")){
      //     queue.pop();
      //     continue;
      //   }
        
        await page.goto(url,{waitUntil: 'networkidle2', timeout: 0});
        registry[url] = await page.$eval("*", (el) => el.innerText);
        let content  = registry[url].replace(/\n/g, " ").replace(/\t/g, " ").replace(/&nbsp;/g, " ");
        let WordCount = getWordCount(content);
        data.push({
          url,
          content,
          WordCount
        });
        let domainLink = await DomainLink.query().upsertGraph({
            domain_id : domain.id,  
            link : url,
            content,
            word_count : WordCount
        });
        queue.pop();
        console.log("queue length", queue);
  
        const hrefs = await page.$$eval("a", (anchorEls) =>
          anchorEls.map((a) => a.href)
        );
  
        const filteredHrefs = hrefs.filter(
          (href) => href.startsWith(website) && registry[href] === undefined
        );
        let uniqueHrefs = [...new Set(filteredHrefs)];
        queue.push(...uniqueHrefs);
        queue = queue.map((q)=>q.split("?")[0].split("#")[0]) 
        queue = [...new Set(queue)];
  
        await page.close();
      //   i++;
      //   if(i==10){
      //       break;
      //   }
      }
  
      browser.close();
      console.log(data);
      const mailOptions = {
        from: 'your_email@gmail.com',
        to: 'your_email@gmail.com',
        subject: `Result for ${domain.domain}`,
        text: `Click here to see results ${root_url}/domain/${domain.id}`
      };
      SendEmail(mailOptions);
      return "Scrapping Done";
    } catch (e) {
      console.log(e);
      return "Something broke";
    }
  }

  function getWordCount(str) {
    return str.trim().split(/\s+/).length;
  }

module.exports = {
  add,
  addLink,
  getAll,
  getOne,
  deleted
};
