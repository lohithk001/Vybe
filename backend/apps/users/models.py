import uuid
from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    PermissionsMixin,
    BaseUserManager,
)

class UserManager(BaseUserManager):
    """Custom user manager supporting email-first authentication."""

    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError('An email address is required.')
        if not username:
            raise ValueError('A username is required.')

        email = self.normalize_email(email).lower()
        username = username.strip().lower()

        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)

        user = self.model(email=email, username=username, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()

        user.save(using=self._db)

        # Ensure user profile is created
        Profile.objects.get_or_create(user=user)

        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, username, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom user model for VYBE.
    Uses UUID primary key and email as the primary login credential.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, db_index=True)
    username = models.CharField(max_length=50, unique=True, db_index=True)
    display_name = models.CharField(max_length=100, blank=True)
    avatar_color = models.CharField(max_length=20, default='#FF5CA8')
    avatar_url = models.URLField(max_length=500, blank=True)
    bio = models.TextField(max_length=500, blank=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.username} ({self.email})"

    @property
    def name(self):
        return self.display_name or self.username


class Profile(models.Model):
    """
    Listener Profile storing listener preferences, mood alignments,
    and listening statistics.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    preferred_moods = models.JSONField(default=list, blank=True)
    favorite_genres = models.JSONField(default=list, blank=True)
    listening_time_minutes = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Listener Profile'
        verbose_name_plural = 'Listener Profiles'

    def __str__(self):
        return f"Profile of {self.user.username}"
