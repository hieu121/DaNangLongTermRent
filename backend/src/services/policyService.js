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

const getAllPolicies = async () => policyRepository.getAllPolicies();

const updatePolicy = async (id, payload) => {
  const existing = await policyRepository.getPolicyById(id);
  if (!existing) throw Object.assign(new Error("Policy not found"), { status: 404 });
  await policyRepository.updatePolicy(id, payload);
};

const deletePolicy = async (id) => {
  const existing = await policyRepository.getPolicyById(id);
  if (!existing) throw Object.assign(new Error("Policy not found"), { status: 404 });
  await policyRepository.updatePolicy(id, { isActive: false });
};

module.exports = { getPolicyState, acceptPolicy, createPolicy, getAllPolicies, updatePolicy, deletePolicy };
