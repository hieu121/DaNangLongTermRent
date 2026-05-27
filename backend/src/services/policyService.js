const policyRepository = require("../repositories/policyRepository");
const notificationRepository = require("../repositories/notificationRepository");
const userRepository = require("../repositories/userRepository");

const getPolicyState = async (userId, role) => {
  const latestPolicy = await policyRepository.getLatestPolicyByRole(role);
  if (!latestPolicy) {
    return { mustAccept: false, latestPolicy: null };
  }
  const acceptance = await policyRepository.getAcceptance(userId, latestPolicy.id);
  return {
    mustAccept: !acceptance || acceptance.version < latestPolicy.version,
    latestPolicy
  };
};

const acceptPolicy = async (userId, role) => {
  const latestPolicy = await policyRepository.getLatestPolicyByRole(role);
  if (!latestPolicy) {
    return null;
  }
  await policyRepository.acceptPolicy(userId, latestPolicy.id, latestPolicy.version);
  return latestPolicy;
};

const createPolicy = async ({ role, title, content, version }) => {
  const id = await policyRepository.createPolicy({ role, title, content, version });
  const users = await userRepository.findAllUsers();
  const targets = users.filter((u) => u.role === role);
  await Promise.all(
    targets.map((u) =>
      notificationRepository.createNotification({
        userId: u.id,
        type: "policy",
        content: `Policy ${role} updated to version ${version}`
      })
    )
  );
  return id;
};

module.exports = { getPolicyState, acceptPolicy, createPolicy };
