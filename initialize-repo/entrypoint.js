const {Toolkit} = require('actions-toolkit')
const GitHub = require('@octokit/rest')

const tools = new Toolkit()

tools.log.info('token', process.env.ADMIN_TOKEN)
const github = new GitHub({auth: process.env.ADMIN_TOKEN})

if (process.env.DEBUG === 'true') debug()

enableVulnerabilityScanning()

async function enableVulnerabilityScanning() {
  return checkStatus(
    await github.repos.enableVulnerabilityAlerts({
      owner: tools.context.payload.organization.login,
      repo: tools.context.payload.repository.name
  }))
}

/**
 * Apply an assignee to the issue in this action.
 *
 * ex. `args = 'assign @jclem'`
 */
async function doAssign() {
  filterAction(tools.arguments.action)
  const assignees = tools.arguments._.slice(1)
  tools.log.info('assign', assignees)
  return checkStatus(
    await tools.github.issues.addAssignees(tools.context.issue({assignees}))
  )
}

/**
 * Create a new comment on the issue in this action.
 *
 * ex. `args = 'comment Hello, world!'`
 */
async function doComment() {
  filterAction(tools.arguments.action)
  const body = tools.arguments._.slice(1).join(' ')
  tools.log.info('comment', body)
  return checkStatus(
    await tools.github.issues.createComment(tools.context.issue({body}))
  )
}

/**
 * Apply a label to the issue in this action.
 *
 * ex. `args = 'label bug'`
 */
async function doLabel() {
  filterAction(tools.arguments.action)
  const labels = tools.arguments._.slice(1)
  tools.log.info('label', labels)
  return checkStatus(
    await tools.github.issues.addLabels(tools.context.issue({labels}))
  )
}

function checkStatus(result) {
  if (result.status >= 200 && result.status < 300) {
    return result
  }

  tools.exit.failure(`Received status ${result.status} from API.`)
}

function filterAction(action) {
  if (!action) return

  if (tools.context.payload.action !== action) {
    tools.log.note(
      `Action "${
        tools.context.payload.action
      } does not match "${action}" from arguments.`
    )

    tools.exit.neutral()
  }
}

function debug() {
  tools.log.debug('Action', tools.context.action)
  tools.log.debug('Actor', tools.context.actor)
  tools.log.debug('Arguments', tools.arguments)
  tools.log.debug('Event', tools.context.event)
  tools.log.debug('Ref', tools.context.ref)
  tools.log.debug('Sha', tools.context.sha)
  tools.log.debug('Workflow', tools.context.workflow)
  if (process.env.DEBUG_PAYLOAD === 'true')
    tools.log.debug('Payload', tools.context.payload)
}
