import Map "mo:core/Map";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Float "mo:core/Float";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type Candidate = {
    id : Nat;
    name : Text;
    partyName : Text;
    position : Text;
    voteCount : Nat;
  };

  module Candidate {
    public func compare(candidate1 : Candidate, candidate2 : Candidate) : Order.Order {
      Text.compare(candidate1.name, candidate2.name);
    };
  };

  type Voter = {
    voterId : Text;
    name : Text;
    email : Text;
    hasVoted : Bool;
    otp : ?Text;
  };

  type Election = {
    isActive : Bool;
  };

  type CandidateDTO = {
    id : Nat;
    name : Text;
    partyName : Text;
    position : Text;
    voteCount : Nat;
    votePercentage : Float;
  };

  type ElectionStatus = {
    isActive : Bool;
    totalVotes : Nat;
  };

  public type UserProfile = {
    name : Text;
    voterId : ?Text;
  };

  let candidatesMap = Map.empty<Nat, Candidate>();
  let votersMap = Map.empty<Text, Voter>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let voterPrincipalMap = Map.empty<Text, Principal>();
  var electionStatus : Election = { isActive = false };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func addCandidate(id : Nat, name : Text, partyName : Text, position : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let candidate : Candidate = {
      id;
      name;
      partyName;
      position;
      voteCount = 0;
    };
    candidatesMap.add(id, candidate);
  };

  public shared ({ caller }) func editCandidate(id : Nat, name : Text, partyName : Text, position : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (candidatesMap.get(id)) {
      case (null) { Runtime.trap("Candidate not found") };
      case (?existing) {
        let updated : Candidate = {
          id;
          name;
          partyName;
          position;
          voteCount = existing.voteCount;
        };
        candidatesMap.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteCandidate(id : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (not candidatesMap.containsKey(id)) {
      Runtime.trap("Candidate not found");
    };
    candidatesMap.remove(id);
  };

  public shared ({ caller }) func addVoter(voterId : Text, name : Text, email : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let newVoter : Voter = {
      voterId;
      name;
      email;
      hasVoted = false;
      otp = null;
    };
    votersMap.add(voterId, newVoter);
  };

  public shared ({ caller }) func updateVoter(voterId : Text, name : Text, email : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (votersMap.get(voterId)) {
      case (null) { Runtime.trap("Voter not found") };
      case (_) {
        let updatedVoter : Voter = {
          voterId;
          name;
          email;
          hasVoted = false;
          otp = null;
        };
        votersMap.add(voterId, updatedVoter);
      };
    };
  };

  public shared ({ caller }) func deleteVoter(voterId : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (not votersMap.containsKey(voterId)) {
      Runtime.trap("Voter not found");
    };
    votersMap.remove(voterId);
  };

  public shared ({ caller }) func startElection() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    electionStatus := { isActive = true };
  };

  public shared ({ caller }) func endElection() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    electionStatus := { isActive = false };
  };

  public query ({ caller }) func getElectionStatus() : async Bool {
    electionStatus.isActive;
  };

  public query ({ caller }) func getCandidates() : async [Candidate] {
    candidatesMap.values().toArray().sort();
  };

  public query ({ caller }) func getResults() : async [CandidateDTO] {
    let totalVotes = candidatesMap.values().toArray().foldLeft(0, func(acc, candidate) { acc + candidate.voteCount });
    let candidatesArray = candidatesMap.values().toArray();
    candidatesArray.map(
      func(candidate) {
        let percentage = if (totalVotes == 0) { 0.0 } else {
          candidate.voteCount.toFloat() / totalVotes.toFloat() * 100.0;
        };
        {
          id = candidate.id;
          name = candidate.name;
          partyName = candidate.partyName;
          position = candidate.position;
          voteCount = candidate.voteCount;
          votePercentage = percentage;
        };
      }
    );
  };

  func generateOTP() : Nat {
    123456;
  };

  public shared ({ caller }) func login(voterId : Text) : async Bool {
    switch (votersMap.get(voterId)) {
      case (null) { return false };
      case (?voter) {
        let otp = generateOTP();
        let updated : Voter = {
          voterId = voter.voterId;
          name = voter.name;
          email = voter.email;
          hasVoted = voter.hasVoted;
          otp = ?otp.toText();
        };
        votersMap.add(voterId, updated);
        voterPrincipalMap.add(voterId, caller);
        return true;
      };
    };
  };

  public shared ({ caller }) func verifyOTP(voterId : Text, inputOtp : Text) : async Bool {
    switch (voterPrincipalMap.get(voterId)) {
      case (null) { return false };
      case (?registeredPrincipal) {
        if (caller != registeredPrincipal) {
          return false;
        };
      };
    };

    switch (votersMap.get(voterId)) {
      case (null) { return false };
      case (?voter) {
        switch (voter.otp) {
          case (null) { return false };
          case (?storedOtp) {
            if (storedOtp == inputOtp) {
              let updated : Voter = {
                voterId = voter.voterId;
                name = voter.name;
                email = voter.email;
                hasVoted = voter.hasVoted;
                otp = null;
              };
              votersMap.add(voterId, updated);
              return true;
            } else { return false };
          };
        };
      };
    };
  };

  public shared ({ caller }) func castVote(callerVoterId : Text, candidateId : Nat, otp : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can cast votes");
    };

    switch (voterPrincipalMap.get(callerVoterId)) {
      case (null) { return false };
      case (?registeredPrincipal) {
        if (caller != registeredPrincipal) {
          return false;
        };
      };
    };

    if (not electionStatus.isActive) { return false };

    func validateVoter() : Bool {
      switch (votersMap.get(callerVoterId)) {
        case (null) { return false };
        case (?voter) {
          switch (voter.otp) {
            case (null) { return false };
            case (?storedOtp) {
              if (storedOtp != otp or voter.hasVoted) { return false };
              let updated : Voter = {
                voterId = voter.voterId;
                name = voter.name;
                email = voter.email;
                hasVoted = true;
                otp = null;
              };
              votersMap.add(callerVoterId, updated);
              return true;
            };
          };
        };
      };
    };

    switch (candidatesMap.get(candidateId)) {
      case (null) { return false };
      case (?candidate) {
        if (not validateVoter()) { return false };

        let updated : Candidate = {
          id = candidate.id;
          name = candidate.name;
          partyName = candidate.partyName;
          position = candidate.position;
          voteCount = candidate.voteCount + 1;
        };
        candidatesMap.add(candidateId, updated);
        return true;
      };
    };
  };

  public query ({ caller }) func getElectionSummary() : async ElectionStatus {
    let totalVotes = candidatesMap.values().toArray().foldLeft(0, func(acc, candidate) { acc + candidate.voteCount });
    {
      isActive = electionStatus.isActive;
      totalVotes;
    };
  };
};
