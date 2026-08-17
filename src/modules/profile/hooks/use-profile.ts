import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileService } from "../services/fake-profile.service";
import { UserProfile } from "../types/profile";
import { toast } from "sonner";

export function useProfile() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["user-profile"],
    queryFn: () => profileService.getProfile(),
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
    updateProfile: mutation.mutate,
    isUpdating: mutation.isPending,
  };
}
