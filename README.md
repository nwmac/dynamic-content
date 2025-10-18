# Dynamic Content Test UI Extension

This is a UI extension to help test the Dynamic Content feature.

To add this extension to Rancher, go to Apps > Repositories and click 'Create'.

Enter a name, e.g. 'dynamic-content-test', leave the radio button 'http(s) repository ...' amd for the `Index URL`, enter:

`https://nwmac.github.io/dynamic-content/`

Click `Create`.

Wait for the repository to be refreshed.

Go to `Extensions` > 'Available'. You should see the `Test Dynamic Content` extension. Install it and refresh the UI when told to do so.

## Enabling Debug/Testing

Once installed, you'll see a new 'speech bubble' icon in the app bar a the side. Click on this.

You should get the 'Dynamic Content Test' page. Initially is will show debugging is not enabled.

After a few seconds, the button in the top-right should change to `Enable Debug Mode` - once it does, click the button.

The UI will refresh and show you two columns.

On the left is the dynamic content package in a text area and a version input box.

On the right is the log from the dynamic content processing.

## Updating

You can edit the JSON content in the left-hand panel and/or edit the version input and press `Update` to store and reload the UI, which will then use this test data. Note that
the dynamic content processor waits 3 seconds after UI load before processing the test data.

## New Release Notifications

To test this, set the version number to `2.12.1`, paste this text into the input box and press `Update`.

```
{
  "version": 1,
  "releases": [
    {
      "name": "2.12.2"
    }
  ]
}
```

You should get a single notification in the notification centre to say that a new release, 2.12.2 is available.

Now, paste this text into the input box and press `Update`:

```
{
  "version": 1,
  "releases": [
    {
      "name": "2.12.3"
    },
    {
      "name": "2.13.0"
    }
  ]
}
```

You should get a single notification in the notification centre to say that are multiple new releases, 2.12.3 and 2.13.0.

## Upcoming End Of Maintenance Notifications

To test this, set the version number to `2.12.1`, paste this text into the input box and press `Update`.

```
{
  "version": 1,
  "support": {
    "upcoming": {
      "eom": {
        "version": "<=2.12",
        "date": "2025-10-31"
      }
    }
  }
}
```

(Note: Check the `data` above and adjust to be a date after the current date)

You should get a visible warning growl and a notification in the notification centre to say that end of maintenance is approaching.

## Upcoming End Of Life Notifications

Follow the steps above for end of maintenance, but replace `eom` with `eol`

## End Of Maintenance Notifications

To test this, set the version number to `2.12.1`, paste this text into the input box and press `Update`.

```
{
  "version": 1,
  "support": {
    "status": {
      "eom": "<=2.12"
    }
  }
}
```

(Note: Check the `data` above and adjust to be a date after the current date)

You should get a visible warning growl and a notification in the notification centre to say that end of maintenance has been reached.

## End Of Life Notifications

Follow the steps above for end of maintenance, but replace `eom` with `eol`

## Clear Notifications and Reset Read Prefs

There are 2 other buttons:

- Clear Notifications - This will clear all notifications. Useful for clearing them out - in most cases, new notifications are not added if existing ones are there
- Reset Read Prefs - A number of user preferences are used to record if notifications have been read. If a notification has been read and then notifications cleared,
a new notification for the same case will not be shown again, because Rancher will determine that the user has already seen it and acknowledged it. `Reset Read Prefs`
will reset all of the relevant user preferences back to the unread state.

# Sample JSON

A sample JSON for all of the above cases that can be edited and used is shown below:

```
{
  "version": 1,
  "releases": [
    {
      "name": "2.12.0"
    }
  ],
  "support": {
    "status": {
      "eom": "<=2.11",
      "eol": "<=2.7"
    },
    "upcoming": {
      "eom": {
        "version": "<=2.11",
        "date": "2025-10-30"
      },
      "eol": {
        "version": "<=2.10",
        "date": "2025-10-30"
      }
    }
  }
}
```