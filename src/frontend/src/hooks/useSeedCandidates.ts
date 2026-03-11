import { useEffect, useRef } from "react";
import { useActor } from "./useActor";

const SEED_CANDIDATES = [
  {
    id: 1n,
    name: "Rajesh Kumar",
    partyName: "National Unity Party",
    position: "Member of Parliament",
  },
  {
    id: 2n,
    name: "Anjali Deshmukh",
    partyName: "People's Progress Party",
    position: "Member of Parliament",
  },
  {
    id: 3n,
    name: "Vikram Singh Rathore",
    partyName: "Democratic Development Party",
    position: "Member of Parliament",
  },
  {
    id: 4n,
    name: "Neha Kulkarni",
    partyName: "Bharat Reform Party",
    position: "Member of Parliament",
  },
  {
    id: 5n,
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
            await actor.addCandidate(c.id, c.name, c.partyName, c.position);
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
