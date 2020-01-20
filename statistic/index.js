const config = {
  OLD_PR: {
    DAYS: 10,
    EXCLUDE_STATUSES: ['needs work', 'on hold'],
  },
};

function isOldPR(pr) {
  const countOfDays = (
    new Date().getTime() -
    new Date(pr.created_at).getTime()
  ) / (1000 * 3600 * 24);
  const allowedStatuses = pr.labels
    .filter(({name}) => config.OLD_PR.EXCLUDE_STATUSES.includes(name));

  return (
    countOfDays > config.OLD_PR.DAYS &&
    allowedStatuses.length === 0
  );
}

function getStatistic(prs) {
  const statistic = new Map();

  for (const pr of prs) {
    const isOld = isOldPR(pr);

    pr.assignees.forEach(({login}) => {
      let personInfo = statistic.get(login);

      if (!personInfo) {
        personInfo = {
          assigneesCount: 0,
          oldPRs: [],
        };

        statistic.set(login, personInfo);
      }

      const info = statistic.get(login);

      Object.assign(info, {
        assigneesCount: info.assigneesCount + 1,
        oldPRs: isOld
          ? [...info.oldPRs, {
            title: pr.title,
            url: pr.html_url,
            created_at: pr.created_at,
          }]
          : info.oldPRs,
      });
    });
  }

  return statistic;
}

function getOldPRsCell(prs) {
  return prs
    .sort((pr1, pr2) => (
      new Date(pr2.created_at).getDay() -
      new Date(pr1.created_at).getDay()
    ))
    .reduce((acc, pr) => acc + `Link: ${pr.url}\n\n`, '');
}

function getTableItem(login, options) {
  const item = {
    'Github Nickname': login,
    'Count of PRs where you are assignee': options.assigneesCount,
  };

  const countOfOldPRs = options.oldPRs.length;

  item[`Count of old assigned PRs (> ${config.OLD_PR.DAYS} days)`] = countOfOldPRs;
  item['Old PRs'] = getOldPRsCell(options.oldPRs);

  return item;
}

async function loadPRs() {
  if (!window.localStorage.getItem('prs')) {
    const response = await fetch('https://api.github.com/repos/google/ggrc-core/pulls?state=open&per_page=100');
    window.localStorage.setItem('prs', await response.text());
  }

  return JSON.parse(window.localStorage.getItem('prs'));
}


customElements.define('app-container', class extends HTMLElement {
  constructor() {
    super();

    loadPRs()
      .then((prs) => {
        const personsInfo = getStatistic(prs);

        this
      });
  }
});

customElements.define('prs-statistic', class extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({mode: 'open'});

    shadow.innerHTML = renderStatistic({
      header: [{name: 'Test 1'}, {name: 'Test 2'}],
      rows: [
        [{text: 'Name 1'}, {text: 'Value 1'}],
        [{text: 'Name 2'}, {text: 'Value 2'}],
      ],
    });
    // attach styles
    const linkElem = document.createElement('link');
    linkElem.setAttribute('rel', 'stylesheet');
    linkElem.setAttribute('href', 'styles.css');
    shadow.appendChild(linkElem);
  }
});

function resolveTemplateParam(param) {
  if (param instanceof Array) {
    return param.join('');
  }

  if (typeof param === 'string') {
    return param;
  }

  throw TypeError('Unrecognized type is passed');
}

function htmlTemplate(strings, ...params) {
  return params.reduce((result, param, index) => (
    result +
    resolveTemplateParam(param) +
    strings[index + 1]
  ), strings[0]).trim();
}

function renderTableRow(row) {
  const rowContent = row.map(({text}, index) => index === 0
    ? `<th>${text}</th>`
    : `<td>${text}</td>`);

  return htmlTemplate`<tr>${rowContent}</tr>`;
}

function renderStatistic({header, rows}) {
  return htmlTemplate`
    <table class="grid-container">
      <thead>
        <tr>
          ${header.map(({name}) => `<th>${name}</th>`)}
        </tr>
      </thead>
      <tbody>
        ${rows.map((row) => renderTableRow(row))}
      </tbody>
    </table>
  `;
}
