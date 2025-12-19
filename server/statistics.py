def getStat(config):
    try:
        connection = sqlite3.connect(dbPath)
        db = connection.cursor()

        stats = {
            "overall": {
                "questions": {"approved": 0, "unapproved": 0},
                "papers": {"approved": 0, "unapproved": 0},
                "topicals": {"approved": 0, "unapproved": 0},
            },
            "byBoard": {},
        }

        for boardName, boardConfig in config.items():
            boardStats = {"levels": {}, "subjects": {}}
            stats["byBoard"][boardName] = boardStats

            for level in boardConfig["levels"]:
                # Normalize A-level variations
                normalized_level = level
                if level.lower() in ["a level", "as level", "a-level", "as-level"]:
                    normalized_level = "A level"

                if normalized_level not in boardStats["levels"]:
                    boardStats["levels"][normalized_level] = {
                        "approvedQuestions": 0,
                        "unapprovedQuestions": 0,
                        "subjects": {},
                    }

                # For A-levels, combine both A and AS level counts
                if level.lower() in ["a level", "as level", "a-level", "as-level"]:
                    approved_count = db.execute(
                        "SELECT COUNT(*) FROM questions WHERE (level = ? OR level = ? OR level = ? OR level = ?) AND approved = ?",
                        ("A level", "AS level", "A Level", "AS Level", True),
                    ).fetchone()[0]
                    unapproved_count = db.execute(
                        "SELECT COUNT(*) FROM questions WHERE (level = ? OR level = ? OR level = ? OR level = ?) AND approved = ?",
                        ("A level", "AS level", "A Level", "AS Level", False),
                    ).fetchone()[0]

                    boardStats["levels"][normalized_level][
                        "approvedQuestions"
                    ] += approved_count
                    boardStats["levels"][normalized_level][
                        "unapprovedQuestions"
                    ] += unapproved_count

                    # Handle subjects for A-levels
                    for subject in boardConfig["subjects"]:
                        subjectName = subject["name"]
                        if (
                            subjectName
                            not in boardStats["levels"][normalized_level]["subjects"]
                        ):
                            boardStats["levels"][normalized_level]["subjects"][
                                subjectName
                            ] = {
                                "approved": 0,
                                "unapproved": 0,
                                "approvedPapers": 0,
                                "unapprovedPapers": 0,
                                "approvedTopicals": 0,
                                "unapprovedTopicals": 0,
                            }

                        # Combine A and AS level counts for each subject
                        approved = db.execute(
                            "SELECT COUNT(*) FROM questions WHERE (level = ? OR level = ? OR level = ? OR level = ?) AND subject = ? AND approved = ?",
                            (
                                "A level",
                                "AS level",
                                "A Level",
                                "AS Level",
                                subjectName,
                                True,
                            ),
                        ).fetchone()[0]
                        unapproved = db.execute(
                            "SELECT COUNT(*) FROM questions WHERE (level = ? OR level = ? OR level = ? OR level = ?) AND subject = ? AND approved = ?",
                            (
                                "A level",
                                "AS level",
                                "A Level",
                                "AS Level",
                                subjectName,
                                False,
                            ),
                        ).fetchone()[0]

                        approved_papers = db.execute(
                            "SELECT COUNT(*) FROM papers WHERE (level = ? OR level = ? OR level = ? OR level = ?) AND subject = ? AND approved = ?",
                            (
                                "A level",
                                "AS level",
                                "A Level",
                                "AS Level",
                                subjectName,
                                True,
                            ),
                        ).fetchone()[0]
                        unapproved_papers = db.execute(
                            "SELECT COUNT(*) FROM papers WHERE (level = ? OR level = ? OR level = ? OR level = ?) AND subject = ? AND approved = ?",
                            (
                                "A level",
                                "AS level",
                                "A Level",
                                "AS Level",
                                subjectName,
                                False,
                            ),
                        ).fetchone()[0]

                        approved_topicals = db.execute(
                            "SELECT COUNT(*) FROM topicals WHERE subject = ? AND approved = ?",
                            (subjectName, True),
                        ).fetchone()[0]

                        unapproved_topicals = db.execute(
                            "SELECT COUNT(*) FROM topicals WHERE subject = ? AND approved = ?",
                            (subjectName, False),
                        ).fetchone()[0]
                        boardStats["levels"][normalized_level]["subjects"][
                            subjectName
                        ].update(
                            {
                                "approved": approved,
                                "unapproved": unapproved,
                                "approvedPapers": approved_papers,
                                "unapprovedPapers": unapproved_papers,
                                "approvedTopicals": approved_topicals,
                                "unapprovedTopicals": unapproved_topicals,
                            }
                        )

                else:
                    # Handle non-A-level statistics as before
                    boardStats["levels"][normalized_level]["approvedQuestions"] = (
                        db.execute(
                            "SELECT COUNT(*) FROM questions WHERE level = ? AND approved = ?",
                            (level, True),
                        ).fetchone()[0]
                    )
                    boardStats["levels"][normalized_level]["unapprovedQuestions"] = (
                        db.execute(
                            "SELECT COUNT(*) FROM questions WHERE level = ? AND approved = ?",
                            (level, False),
                        ).fetchone()[0]
                    )

                    for subject in boardConfig["subjects"]:
                        subjectName = subject["name"]
                        boardStats["levels"][normalized_level]["subjects"][
                            subjectName
                        ] = {
                            "approved": db.execute(
                                "SELECT COUNT(*) FROM questions WHERE level = ? AND subject = ? AND approved = ?",
                                (level, subjectName, True),
                            ).fetchone()[0],
                            "unapproved": db.execute(
                                "SELECT COUNT(*) FROM questions WHERE level = ? AND subject = ? AND approved = ?",
                                (level, subjectName, False),
                            ).fetchone()[0],
                            "approvedPapers": db.execute(
                                "SELECT COUNT(*) FROM papers WHERE level = ? AND subject = ? AND approved = ?",
                                (level, subjectName, True),
                            ).fetchone()[0],
                            "unapprovedPapers": db.execute(
                                "SELECT COUNT(*) FROM papers WHERE level = ? AND subject = ? AND approved = ?",
                                (level, subjectName, False),
                            ).fetchone()[0],
                        }

        # Update overall stats
        stats["overall"]["questions"]["approved"] = db.execute(
            "SELECT COUNT(*) FROM questions WHERE approved = ?", (True,)
        ).fetchone()[0]
        stats["overall"]["questions"]["unapproved"] = db.execute(
            "SELECT COUNT(*) FROM questions WHERE approved = ?", (False,)
        ).fetchone()[0]
        stats["overall"]["papers"]["approved"] = db.execute(
            "SELECT COUNT(*) FROM papers WHERE approved = ?", (True,)
        ).fetchone()[0]
        stats["overall"]["papers"]["unapproved"] = db.execute(
            "SELECT COUNT(*) FROM papers WHERE approved = ?", (False,)
        ).fetchone()[0]
        stats["overall"]["topicals"]["approved"] = db.execute(
            "SELECT COUNT(*) FROM topicals WHERE approved = ?", (True,)
        ).fetchone()[0]
        stats["overall"]["topicals"]["unapproved"] = db.execute(
            "SELECT COUNT(*) FROM topicals WHERE approved = ?", (False,)
        ).fetchone()[0]
        connection.close()
        return stats

    except sqlite3.Error as e:
        logger.error(f"Error gathering stats: {e}")
        return {"error": "Failed to retrieve stats"}
