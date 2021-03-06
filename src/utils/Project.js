
/*
class Project {
constructor(Object project) {};
newOne();
vote(Array dates);
update(Number deadline);
remove();
getStats();
}
*/
import axios from 'axios';

class Project {
  constructor(project) {
    this.id = project.id;
    this.team = project.team;
    this.title = project.title;
    this.minDuration = project.minDuration;
    this.description = project.description;
    this.location = project.location;
    this.finaldate = project.finaldate;
    this.deadline = project.deadline;
    this.ended = project.ended;
    this.superuser = project.superuser;
    this.normaluser = project.normaluser;
    this.optionaluser = project.optionaluser;
    this.closeduser = project.closeduser;
    this.votes = project.votes;
  }
  newOne() {
    axios.post('/api/project/new', {
      id: this.id,
      team: this.team,
      title: this.title,
      minDuration: this.minDuration,
      description: this.description,
      location: this.location,
      finaldate: this.finaldate,
      deadline: this.deadline,
      ended: this.ended,
      superuser: this.superuser,
      normaluser: this.normaluser,
      optionaluser: this.optionaluser,
      closeduser: this.closeduser,
      votes: this.votes,
    })
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    });
  }
  vote(userId, dates) {
    axios.post('/api/project/vote/', {
      projectId: this.id,
      dates,
    })
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    });
  }
  update(deadline) {
    axios.post('/api/project/update/', {
      projectId: this.id,
      ended: false,
      deadline,
    })
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    });
  }
  remove() {
    axios.delete('/api/project/remove/', {
      projectId: this.id,
    })
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    });
  }
  getStats() {
    axios.get(`/api/project/stats/${this.id}/`)
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    });
  }
}

export default Project;
