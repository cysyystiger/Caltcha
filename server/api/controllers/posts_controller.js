import Post from '../models/Post';

const tdtn = require('./functions/tdtn');
const tntd = require('./functions/tntd');
const conti = require('./functions/conti');
const test = require('../../../test.json');

const teams = test.team;
const users = test.user;
const projects = test.project;

module.exports = {
  getteamanduser(req, res) {
    console.log(`${req.user.id} call /api/profile`);
    const sendteam = teams.filter((team) => {
      return (typeof req.user.team.find(item => (item === team.id)) !== 'undefined');
    });
    const senduser = req.user;
    senduser.password = 'undefined';
    /*
    console.log(userId);
    for (let i = 0; i < teams.length; i += 1) {
      for (let j = 0; j < teams[i].members.length; j += 1) {
        if (userId === teams[i].members[j]) {
          sendteam.push(teams[i]);
        }
      }
    }
    for (let i = 0; i < users.length; i += 1) {
      if (userId === users[i].id) {
        senduser = users[i];
      }
    }
    */
    res.send({ teams: sendteam, user: senduser });
  },

  getprojects(req, res) {
    const sendproject = [];
    const userId = req.user.id;
    for (let i = 0; i < projects.length; i += 1) {
      if (userId === projects[i].superuser) {
        sendproject.push(projects[i]);
      } else {
        for (let j = 0; j < projects[i].normaluser.length; j += 1) {
          if (userId === projects[i].normaluser[j]) {
            sendproject.push(projects[i]);
          }
        }
        for (let j = 0; j < projects[i].optionaluser.length; j += 1) {
          if (userId === projects[i].optionaluser[j]) {
            sendproject.push(projects[i]);
          }
        }
      }
    }
    res.send({ projects: sendproject });
  },

  createnewproject(req, res) {
    console.log(req.body);
    const newproject = req.body;
    console.log(newproject);
    projects.push(newproject);
    res.send(`Create ${newproject.title} Successfully`);
  },

  updateproject(req, res) {
    const request = req.body;
    const userId = req.user.id;
    for (let i = 0; i < projects.length; i += 1) {
      if (projects[i].id === request.projectId) {
        if (projects[i].superuser === userId) {
          projects[i].ended = request.ended;
          projects[i].deadline = request.deadline;
          res.send(`You have updated ${projects[i].title} successfully!!`);
        } else {
          res.send('You are not superuser, so you cannot update this project!');
        }
      }
    }
  },

  getstats(req, res) {
    const projectId = req.params.projectId;
    const userId = req.user.id;
    const stats = [];
    for (let i = 0; i < projects.length; i += 1) {
      if (projectId === projects[i].id) {
        if (userId !== projects[i].superuser) {
          res.send('You are not superuser, so you cannot examine the vote!');
        } else {
          let c = 0;
          const nornotvote = [];
          const nordates = [];
          for (let j = 0; j < projects[i].normaluser.length; j += 1) {
            for (let k = 0; k < projects[i].votes.length; k += 1) {
              if (projects[i].normaluser[j] === projects[i].votes[k].userid) {
                nordates.push(projects[i].votes[k].dates);
              } else {
                c += 1;
              }
            }
            if (c === projects[i].votes.length) {
              nornotvote.push(projects[i].normaluser[j]);
            }
          }
          if (nordates.length !== projects[i].normaluser.length) {
            res.send({
              warn: 'There are some normalusers have not voted',
              normalusernovote: nornotvote,
            });
          } else {
            const blocksarr = [];
            let middle = [];
            for (let j = 0; j < nordates.length; j += 1) {
              middle = [];
              for (let k = 0; k < nordates[j].length; k += 1) {
                for (let m = 0; m < nordates[j][k].timeblocks.length; m += 1) {
                  middle.push((tdtn(nordates[j][k].date) * 48) + nordates[j][k].timeblocks[m]);
                }
              }
              blocksarr.push(middle);
            }
            const optarr = [];
            let center = [];
            for (let j = 0; j < projects[i].optionaluser.length; j += 1) {
              center = [];
              for (let k = 0; k < projects[i].votes.length; k += 1) {
                if (projects[i].optionaluser[j] === projects[i].votes[k].userid) {
                  for (let m = 0; m < projects[i].votes[k].dates.length; m += 1) {
                    for (let n = 0; n < projects[i].votes[k].dates[m].timeblocks.length; n += 1) {
                      center.push((tdtn(projects[i].votes[k].dates[m].date) * 48) + projects[i].votes[k].dates[m].timeblocks[n]);
                    }
                  }
                }
              }
              optarr.push(center);
            }
            const basic = blocksarr[0];
            const finalblocks = [];
            let count;
            for (let m = 0; m < basic.length; m += 1) {
              count = 0;
              for (let j = 0; j < blocksarr.length; j += 1) {
                for (let k = 0; k < blocksarr[j].length; k += 1) {
                  if (basic[m] === blocksarr[j][k]) {
                    count += 1;
                  }
                }
              }
              if (count === blocksarr.length) {
                finalblocks.push(basic[m]);
              }
            }
            const contiblocks = conti(finalblocks, projects[i].minDuration);
            const conobj = [];
            let copt;
            let coopt;
            for (let j = 0; j < contiblocks.length; j += 1) {
              coopt = 0;
              for (let m = 0; m < optarr.length; m += 1) {
                copt = 0;
                for (let k = 0; k < projects[i].minDuration; k += 1) {
                  for (let n = 0; n < optarr[m].length; n += 1) {
                    if (contiblocks[j][k] === optarr[m][n]) {
                      copt += 1;
                    }
                  }
                }
                if (copt === projects[i].minDuration) {
                  coopt += 1;
                }
              }
              conobj.push({ contidays: contiblocks[j], optnum: coopt });
            }
            for (let j = 0; j < conobj.length; j += 1) {
              stats.push(tntd(conobj[j]));
            }
            res.send({ stats });
          }
        }
      }
    }
  },

  uservote(req, res) {
    const request = req.body;
    const userId = req.user.id;
    let b = 1;
    for (let i = 0; i < projects.length; i += 1) {
      if (projects[i].id === request.projectId) {
        for (let j = 0; j < projects[i].votes.length; j += 1) {
          if (projects[i].votes[j].userid === userId) {
            projects[i].votes[j].dates = request.dates;
            b = 0;
            res.send('You have voted successfully!!');
          }
        }
        if (b) {
          projects[i].votes.push({ userid: userId, dates: request.dates });
          res.send('You have voted successfully!!');
        }
      }
    }
  },
  rmproject(req, res) {
    const request = req.body;
    const userId = req.user.id;
    for (let i = 0; i < projects.length; i += 1) {
      if (projects[i].id === request.projectId) {
        if (projects[i].superuser === userId) {
          projects.splice(i, 1);
          res.send(`You have removed ${projects[i].title} successfully!!`);
        } else {
          res.send('You are not superuser, so you cannot delete this project!');
        }
      }
    }
  },
};
