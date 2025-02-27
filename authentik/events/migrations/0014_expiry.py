# Generated by Django 3.1.7 on 2021-03-18 16:01

from datetime import timedelta
from typing import Iterable

from django.apps.registry import Apps
from django.db import migrations, models
from django.db.backends.base.schema import BaseDatabaseSchemaEditor

import authentik.events.models


# Taken from https://stackoverflow.com/questions/3173320/text-progress-bar-in-the-console
def progress_bar(
    iterable: Iterable,
    prefix="Writing: ",
    suffix=" finished",
    decimals=1,
    length=100,
    fill="█",
    print_end="\r",
):
    """
    Call in a loop to create terminal progress bar
    @params:
        iteration   - Required  : current iteration (Int)
        total       - Required  : total iterations (Int)
        prefix      - Optional  : prefix string (Str)
        suffix      - Optional  : suffix string (Str)
        decimals    - Optional  : positive number of decimals in percent complete (Int)
        length      - Optional  : character length of bar (Int)
        fill        - Optional  : bar fill character (Str)
        print_end   - Optional  : end character (e.g. "\r", "\r\n") (Str)
    """
    total = len(iterable)
    if total < 1:
        return

    def print_progress_bar(iteration):
        """Progress Bar Printing Function"""
        percent = ("{0:." + str(decimals) + "f}").format(100 * (iteration / float(total)))
        filledLength = int(length * iteration // total)
        bar = fill * filledLength + "-" * (length - filledLength)
        print(f"\r{prefix} |{bar}| {percent}% {suffix}", end=print_end)

    # Initial Call
    print_progress_bar(0)
    # Update Progress Bar
    for i, item in enumerate(iterable):
        yield item
        print_progress_bar(i + 1)
    # Print New Line on Complete
    print()


def update_expires(apps: Apps, schema_editor: BaseDatabaseSchemaEditor):
    db_alias = schema_editor.connection.alias
    Event = apps.get_model("authentik_events", "event")
    all_events = Event.objects.using(db_alias).all()
    if all_events.count() < 1:
        return

    print("\nAdding expiry to events, this might take a couple of minutes...")
    for event in progress_bar(all_events):
        event.expires = event.created + timedelta(days=365)
        event.save()


class Migration(migrations.Migration):

    dependencies = [
        ("authentik_events", "0013_auto_20210209_1657"),
    ]

    operations = [
        migrations.AddField(
            model_name="event",
            name="expires",
            field=models.DateTimeField(default=authentik.events.models.default_event_duration),
        ),
        migrations.AddField(
            model_name="event",
            name="expiring",
            field=models.BooleanField(default=True),
        ),
        migrations.RunPython(update_expires),
    ]
