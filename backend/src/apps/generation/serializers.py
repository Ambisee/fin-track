import locale

from rest_framework import serializers


class ReportRequestSerializer(serializers.Serializer):

    ledger = serializers.IntegerField()
    month = serializers.IntegerField(min_value=1, max_value=12)
    year = serializers.IntegerField()
    locale = serializers.CharField(max_length=30, default="en-us")

    INVALID_LOCALE_VALUE_MESSAGE = "Invalid locale string. "
    INVALID_LOCALE_FORMAT_MESSAGE = "Invalid locale format. Locales should be provided in the format of XX-XX. i.e. en-us (US english), ja-jp (Japanese), de-de (German), etc."

    class ReportRequest:
        def __init__(self, **kwargs):
            self.ledger = kwargs.get("ledger")
            self.month = kwargs.get("month")
            self.year = kwargs.get("year")
            self.locale = kwargs.get("locale")

    def create(self, validated_data):
        return ReportRequestSerializer.ReportRequest(**validated_data)

    def validate_locale(self, value: str):
        if value.count('-') != 1:
            raise serializers.ValidationError(self.INVALID_LOCALE_FORMAT_MESSAGE)

        if len(value.split('-')) != 2:
            raise serializers.ValidationError(self.INVALID_LOCALE_FORMAT_MESSAGE)
        
        parsed_locale = locale.locale_alias.get(value.replace('-', '_'))
        if parsed_locale is None:
            raise serializers

        return parsed_locale
