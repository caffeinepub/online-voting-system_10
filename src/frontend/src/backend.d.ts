import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ElectionStatus {
    totalVotes: bigint;
    isActive: boolean;
}
export interface CandidateDTO {
    id: bigint;
    voteCount: bigint;
    name: string;
    votePercentage: number;
    partyName: string;
    position: string;
}
export interface Candidate {
    id: bigint;
    voteCount: bigint;
    name: string;
    partyName: string;
    position: string;
}
export interface UserProfile {
    name: string;
    voterId?: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCandidate(name: string, partyName: string, position: string): Promise<void>;
    addVoter(voterId: string, name: string, email: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    castVote(callerVoterId: string, candidateId: bigint, otp: string): Promise<boolean>;
    deleteCandidate(id: bigint): Promise<void>;
    deleteVoter(voterId: string): Promise<void>;
    editCandidate(id: bigint, name: string, partyName: string, position: string): Promise<void>;
    endElection(): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCandidates(): Promise<Array<Candidate>>;
    getElectionStatus(): Promise<boolean>;
    getElectionSummary(): Promise<ElectionStatus>;
    getResults(): Promise<Array<CandidateDTO>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    login(voterId: string): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    startElection(): Promise<void>;
    updateVoter(voterId: string, name: string, email: string): Promise<void>;
    verifyOTP(voterId: string, inputOtp: string): Promise<boolean>;
}
