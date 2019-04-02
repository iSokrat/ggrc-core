# Copyright (C) 2019 Google Inc.
# Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>

"""Integration tests for Program."""

from ggrc.models import all_models

from integration.ggrc import api_helper
from integration.ggrc.models import factories
from integration.ggrc import TestCase


class TestProgram(TestCase):
  """Program test cases."""

  def setUp(self):
    self.api = api_helper.Api()

    with factories.single_commit():
      self.program = factories.ProgramFactory()
      self.audit_id = factories.AuditFactory(program=self.program).id

  def test_put_empty_audits(self):
    """Audit doesn't get deleted when empty audits field is put."""
    response = self.api.put(self.program, data={"audits": []})

    self.assert200(response)
    audit = self.refresh_object(all_models.Audit, id_=self.audit_id)
    self.assertIsNotNone(audit)


class TestMegaProgram(TestCase):
  """Mega Program test cases"""

  def setUp(self):
    """Setup tests"""
    self.api = api_helper.Api()

  def test_is_mega_attr(self):
    """Test is_mega attribute of program"""
    with factories.single_commit():
      program_child = factories.ProgramFactory()
      program_parent = factories.ProgramFactory()
      factories.RelationshipFactory(source=program_parent,
                                    destination=program_child)
    program_child_id = program_child.id
    program_parent_id = program_parent.id
    response = self.api.get(all_models.Program, program_child_id)
    self.assertEqual(response.json["program"]["is_mega"], False)
    response = self.api.get(all_models.Program, program_parent_id)
    self.assertEqual(response.json["program"]["is_mega"], True)
