from rest_framework import permissions

class IsPlaylistOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission allowing anyone to view public playlists,
    but only the owner can modify, delete, or manage tracks.
    """

    def has_object_permission(self, request, view, obj):
        # Safe read operations
        if request.method in permissions.SAFE_METHODS:
            if obj.is_public:
                return True
            return request.user.is_authenticated and obj.user == request.user

        # Write operations strictly restricted to playlist owner
        return request.user.is_authenticated and obj.user == request.user
