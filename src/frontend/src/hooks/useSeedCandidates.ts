import { useEffect, useRef } from "react";
import { useActor } from "./useActor";

const SEED_CANDIDATES = [
  {
    name: "Rajesh Kumar",
    partyName: "National Unity Party",
    position: "Member of Parliament",
  },
  {
    name: "Anjali Deshmukh",
    partyName: "People's Progress Party",
    position: "Member of Parliament",
  },
  {
    name: "Vikram Singh Rathore",
    partyName: "Democratic Development Party",
    position: "Member of Parliament",
  },
  {
    name: "Neha Kulkarni",
    partyName: "Bharat Reform Party",
    position: "Member of Parliament",
  },
  {
    name: "Arjun Patil",
    partyName: "Future India Party",
    position: "Member of Parliament",
  },
];

export function useSeedCandidates() {
  const { actor, isFetching } = useActor();
  const seeded = useRef(false);

  useEffect(() => {
    if (!actor || isFetching || seeded.current) return;

    (async () => {
      try {
        const existing = await actor.getCandidates();
        if (existing.length === 0) {
          seeded.current = true;
          for (const c of SEED_CANDIDATES) {
            await actor.addCandidate(c.name, c.partyName, c.position);
          }
        } else {
          seeded.current = true;
        }
      } catch {
        // silently ignore seed errors
      }
    })();
  }, [actor, isFetching]);
}
