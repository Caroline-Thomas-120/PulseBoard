
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useIssueEvents() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const eventSource = new EventSource(
      `${import.meta.env.VITE_API_URL}/issues/events`
    );

    const refreshIssues = () => {
      queryClient.invalidateQueries({
        queryKey: ["issues"],
      });
    };

    eventSource.addEventListener("issue-created", refreshIssues);
    eventSource.addEventListener("issue-updated", refreshIssues);

    eventSource.onerror = () => {
      console.warn("SSE connection interrupted. Browser will retry.");
    };

    return () => {
      eventSource.close();
    };
  }, [queryClient]);
}
