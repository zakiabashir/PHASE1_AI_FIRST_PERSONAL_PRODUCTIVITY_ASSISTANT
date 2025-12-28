"""
T013: Constants for default values
"""

# T013: Default task priority
DEFAULT_PRIORITY = "medium"

# T013: Default task status
DEFAULT_STATUS = "pending"

# Valid priority values
VALID_PRIORITIES = {"low", "medium", "high"}

# Valid status values
VALID_STATUSES = {"pending", "complete"}

# Title length constraints
TITLE_MIN_LENGTH = 1
TITLE_MAX_LENGTH = 200

# Description length constraints
DESCRIPTION_MAX_LENGTH = 1000

# Confidence threshold for AI intent classification
CONFIDENCE_THRESHOLD = 0.7
