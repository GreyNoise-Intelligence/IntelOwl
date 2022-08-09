# Generated by Django 3.2.14 on 2022-08-09 06:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api_app", "0010_custom_config"),
    ]

    operations = [
        migrations.CreateModel(
            name="PluginCredential",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "type",
                    models.CharField(
                        choices=[("1", "Analyzer"), ("2", "Connector")], max_length=2
                    ),
                ),
                ("attribute", models.CharField(max_length=128, unique=True)),
                ("value", models.TextField()),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("plugin_name", models.CharField(max_length=128)),
            ],
        ),
        migrations.AddIndex(
            model_name="plugincredential",
            index=models.Index(
                fields=["type", "plugin_name", "attribute"],
                name="api_app_plu_type_7ce225_idx",
            ),
        ),
        migrations.AddConstraint(
            model_name="plugincredential",
            constraint=models.UniqueConstraint(
                fields=("type", "attribute", "plugin_name"),
                name="unique_plugin_credential_entry",
            ),
        ),
    ]