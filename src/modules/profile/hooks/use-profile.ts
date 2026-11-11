import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileService } from "../services/profile.service";
import { UserProfile } from "../types/profile";
import { toast } from "sonner";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { getAuthToken } from "@/lib/auth/token-storage";

export function useProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const token = getAuthToken();

  const query = useQuery({
    queryKey: ["user-profile", user?.id || "me"],
    queryFn: () => profileService.getProfile(),
    enabled: Boolean(token && user),
    retry: (failureCount, error: any) => {
      if (error?.status === 401 || error?.code === "UNAUTHORIZED") {
        return false;
      }
      return failureCount < 2;
    },
  });

  const mutation = useMutation({
    mutationFn: (newProfile: UserProfile) => profileService.updateProfile(newProfile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      toast.success("اطلاعات پروفایل با موفقیت بروزرسانی شد");
    },
    onError: () => {
      toast.error("خطا در بروزرسانی اطلاعات");
    },
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    updateProfile: mutation.mutate,
    isUpdating: mutation.isPending,
  };
}
